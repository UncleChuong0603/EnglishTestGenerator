import { useCallback, useState } from "react";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { api, MobileApiError } from "@/api/client";
import type { ProgressResponse } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { Card, ErrorBanner, Loading, Muted, Screen, Title } from "@/components/ui";
import { colors } from "@/theme";

export default function ProgressTab() {
  const auth = useAuth();
  const router = useRouter();
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
  const stateLabel = (state: ProgressResponse["data"]["readiness"]["listening"]["state"]) => ({
    INSUFFICIENT_DATA: vi ? "Chưa đủ dữ liệu" : "Insufficient data",
    NEEDS_WORK: vi ? "Cần củng cố" : "Needs work",
    DEVELOPING: vi ? "Đang phát triển" : "Developing",
    STABLE: vi ? "Ổn định" : "Stable",
    STRONG: vi ? "Vững" : "Strong",
  })[state];
  const actionLabel = (code: ProgressResponse["data"]["readiness"]["actions"][number]["code"]) => ({
    TAKE_DIAGNOSTIC: vi ? "Làm bài đánh giá đầu vào" : "Take the diagnostic",
    REVIEW_MISTAKES: vi ? "Ôn lỗi chưa xử lý" : "Review unresolved mistakes",
    PRACTICE_LISTENING: vi ? "Luyện Listening tiếp theo" : "Practice Listening next",
    PRACTICE_READING: vi ? "Luyện Reading tiếp theo" : "Practice Reading next",
    TAKE_FULL_MOCK: vi ? "Làm Full Mock" : "Take a Full Mock",
    CONTINUE_WEEKLY_PLAN: vi ? "Tiếp tục kế hoạch tuần" : "Continue weekly plan",
  })[code];
  const openAction = async (action: ProgressResponse["data"]["readiness"]["actions"][number]) => {
    if (action.code === "REVIEW_MISTAKES") return router.push("/mistakes" as Href);
    if (action.code === "PRACTICE_LISTENING" || action.code === "PRACTICE_READING") return router.push("/(tabs)/practice" as Href);
    if (action.code === "CONTINUE_WEEKLY_PLAN") return router.push("/(tabs)" as Href);
    await Linking.openURL(`https://toeicgym.net${action.href}`);
  };

  return (
    <Screen>
      <Title>{vi ? "Tiến độ" : "Progress"}</Title>
      <Muted>{vi ? "Dữ liệu này là lịch sử chung của cùng tài khoản trên web và mobile." : "This is the shared learning history for the same account on web and mobile."}</Muted>
      {error ? <ErrorBanner message={error} retry={() => void load()} retryLabel={vi ? "Thử lại" : "Try again"} /> : null}
      {data ? (
        <>
          <Card>
            <Text style={styles.eyebrow}>ROAD TO TARGET</Text>
            <Text accessibilityRole="header" style={styles.sectionTitle}>{vi ? "Sẵn sàng dựa trên bằng chứng" : "Evidence-based readiness"}</Text>
            <Muted>{vi ? "Các trạng thái dùng lịch sử học thật, không phải điểm TOEIC dự đoán hay xác suất đạt mục tiêu." : "States use real learning history—not a predicted TOEIC score or target probability."}</Muted>
            <View style={styles.evidenceGrid}>
              {[{ name: "Listening", value: data.readiness.listening }, { name: "Reading", value: data.readiness.reading }].map(({ name, value }) => (
                <View key={name} style={styles.evidenceCard}>
                  <Text style={styles.label}>{name}</Text>
                  <Text style={styles.state}>{stateLabel(value.state)}</Text>
                  <Text style={styles.metric}>{value.accuracy === null ? "—" : `${value.accuracy}%`}</Text>
                  <Muted>{vi ? `Dựa trên ${value.answered} câu đã trả lời.` : `Based on ${value.answered} answered questions.`}</Muted>
                  {value.answered < value.minimumSample ? <Text style={styles.note}>{vi ? `Cần ít nhất ${value.minimumSample} câu để phân loại.` : `At least ${value.minimumSample} are needed to classify.`}</Text> : null}
                </View>
              ))}
            </View>
            <View style={styles.factRow}><Text style={styles.factLabel}>{vi ? "Tính đều đặn" : "Consistency"}</Text><Text style={styles.factValue}>{stateLabel(data.readiness.consistency.state)} · {data.readiness.consistency.learningDays28}/28 {vi ? "ngày" : "days"}</Text></View>
            <View style={styles.factRow}><Text style={styles.factLabel}>Weekly Plan</Text><Text style={styles.factValue}>{data.readiness.weeklyPlan.planned ? `${data.readiness.weeklyPlan.completed}/${data.readiness.weeklyPlan.planned}` : (vi ? "Chưa có kế hoạch" : "No plan yet")}</Text></View>
            <View style={styles.factRow}><Text style={styles.factLabel}>Diagnostic</Text><Text style={styles.factValue}>{data.readiness.diagnostic.completed ? (vi ? "Đã hoàn tất" : "Completed") : (vi ? "Chưa hoàn tất" : "Not completed")}</Text></View>
            <View style={styles.factRow}><Text style={styles.factLabel}>Full Mock</Text><Text style={styles.factValue}>{data.readiness.mocks.completed} {vi ? "bài đã hoàn tất" : "completed"}</Text></View>
            {data.readiness.priorities.length ? <View style={styles.priority}><Text style={styles.label}>{vi ? "Ưu tiên cần xử lý" : "Priority evidence"}</Text>{data.readiness.priorities.map((item) => <Text key={`${item.part}-${item.skill ?? "part"}`} style={styles.priorityText}>Part {item.part} · {stateLabel(item.state)} · {item.answered} {vi ? "câu" : "answers"}</Text>)}</View> : null}
            <View style={styles.actions}>{data.readiness.actions.map((action) => <Pressable accessibilityRole="button" key={action.code} onPress={() => void openAction(action)} style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}><Text style={styles.actionText}>{actionLabel(action.code)}</Text><Text style={styles.actionText}>→</Text></Pressable>)}</View>
            {data.readiness.mocks.recommended && data.readiness.mocks.access === "QUOTA_REACHED" ? <Text style={styles.limitNote}>{vi ? "Bạn đã dùng hết lượt Full Mock của kỳ hiện tại. Trang Full Mock sẽ hiển thị thời điểm đặt lại." : "You reached the current Full Mock limit. The Full Mock page shows when it resets."}</Text> : null}
          </Card>
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
  eyebrow: { color: colors.forest, fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  sectionTitle: { color: colors.ink, fontSize: 22, lineHeight: 29, fontWeight: "800" },
  evidenceGrid: { gap: 10 },
  evidenceCard: { borderWidth: 1, borderColor: colors.rule, borderRadius: 12, padding: 14, gap: 4 },
  state: { color: colors.forest, fontSize: 15, fontWeight: "800" },
  note: { color: colors.warm, fontSize: 13, lineHeight: 19, fontWeight: "700" },
  factRow: { minHeight: 48, borderTopWidth: 1, borderTopColor: colors.rule, paddingVertical: 10, gap: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  factLabel: { color: colors.ink, fontWeight: "800", flex: 1 },
  factValue: { color: colors.muted, textAlign: "right", flex: 1.4 },
  priority: { backgroundColor: colors.paper, borderRadius: 12, padding: 14, gap: 7 },
  priorityText: { color: colors.muted, lineHeight: 21 },
  actions: { gap: 8 },
  action: { minHeight: 48, backgroundColor: colors.forest, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  actionPressed: { backgroundColor: colors.forestPressed, opacity: 0.75 },
  actionText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  limitNote: { color: "#6d461f", backgroundColor: "#fff7e8", borderRadius: 10, padding: 12, lineHeight: 21 },
  label: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  metric: { color: colors.forest, fontSize: 32, fontWeight: "800" },
  row: { minHeight: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.rule, gap: 12 },
  part: { color: colors.ink, fontWeight: "700" },
  value: { color: colors.muted, flexShrink: 1, textAlign: "right" },
  partLabel: { flex: 1, gap: 6 },
  track: { height: 8, borderRadius: 99, backgroundColor: colors.rule, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.forest },
});
