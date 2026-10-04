import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { api, MobileApiError } from "@/api/client";
import type { ProgressResponse } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { Card, ErrorBanner, Loading, Muted, Screen, Title } from "@/components/ui";
import { colors } from "@/theme";

export default function ProgressTab() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [data, setData] = useState<ProgressResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!auth.token) return;
    setError(null);
    try {
      setData((await api.progress(auth.token)).data);
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") {
        await auth.signOut();
        return;
      }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể tải tiến độ." : "Could not load progress."));
    }
  }, [auth, vi]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!data && !error) return <Screen><Loading label={vi ? "Đang tải tiến độ…" : "Loading progress…"} /></Screen>;
  const summaries: [string, ProgressResponse["data"]["overall"]][] = data ? [
    [vi ? "Tổng" : "Overall", data.overall],
    ["Listening", data.listening],
    ["Reading", data.reading],
  ] : [];

  return (
    <Screen>
      <Title>{vi ? "Tiến độ" : "Progress"}</Title>
      <Muted>{vi ? "Dữ liệu này là lịch sử chung của cùng tài khoản trên web và mobile." : "This is the shared learning history for the same account on web and mobile."}</Muted>
      {error ? <ErrorBanner message={error} retry={() => void load()} retryLabel={vi ? "Thử lại" : "Try again"} /> : null}
      {data ? (
        <>
          <View style={styles.grid}>
            {summaries.map(([label, value]) => (
              <Card key={label}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.metric}>{value.accuracy === null ? "—" : `${value.accuracy}%`}</Text>
                <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: value.accuracy ?? 0 }} style={styles.track}><View style={[styles.fill, { width: `${value.accuracy ?? 0}%` }]} /></View>
                <Muted>{vi ? `${value.correct}/${value.answered} câu đúng` : `${value.correct}/${value.answered} correct`}</Muted>
              </Card>
            ))}
          </View>
          <Card>
            <Text style={styles.label}>{vi ? "Theo Part" : "By part"}</Text>
            {data.parts.length ? data.parts.map((item) => (
              <View key={item.part} style={styles.row}>
                <View style={styles.partLabel}><Text style={styles.part}>Part {item.part}</Text><View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: item.summary.accuracy ?? 0 }} style={styles.track}><View style={[styles.fill, { width: `${item.summary.accuracy ?? 0}%` }]} /></View></View>
                <Text style={styles.value}>{item.summary.accuracy === null ? "—" : `${item.summary.accuracy}%`} · {vi ? `${item.summary.answered} câu` : `${item.summary.answered} answered`}</Text>
              </View>
            )) : <Muted>{vi ? "Chưa có dữ liệu. Hãy hoàn thành bài luyện đầu tiên." : "No data yet. Complete your first practice."}</Muted>}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  label: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  metric: { color: colors.forest, fontSize: 32, fontWeight: "800" },
  row: { minHeight: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.rule, gap: 12 },
  part: { color: colors.ink, fontWeight: "700" },
  value: { color: colors.muted, flexShrink: 1, textAlign: "right" },
  partLabel: { flex: 1, gap: 6 },
  track: { height: 8, borderRadius: 99, backgroundColor: colors.rule, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.forest },
});
