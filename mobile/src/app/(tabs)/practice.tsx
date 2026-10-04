import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { api, MobileApiError } from "@/api/client";
import { useAuth } from "@/auth/auth-context";
import { Card, ErrorBanner, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { partPracticeCommand } from "@/lib/model";
import { colors, space } from "@/theme";

const parts: { part: 1 | 2 | 3 | 4 | 5 | 6 | 7; area: "LISTENING" | "READING"; count: number; vi: string; en: string }[] = [
  { part: 1, area: "LISTENING", count: 5, vi: "Mô tả hình ảnh", en: "Photographs" },
  { part: 2, area: "LISTENING", count: 10, vi: "Hỏi – đáp", en: "Question–response" },
  { part: 3, area: "LISTENING", count: 3, vi: "Hội thoại", en: "Conversations" },
  { part: 4, area: "LISTENING", count: 3, vi: "Bài nói", en: "Talks" },
  { part: 5, area: "READING", count: 10, vi: "Hoàn thành câu", en: "Incomplete sentences" },
  { part: 6, area: "READING", count: 10, vi: "Hoàn thành đoạn văn", en: "Text completion" },
  { part: 7, area: "READING", count: 10, vi: "Đọc hiểu", en: "Reading comprehension" },
];

export default function PracticeTab() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [busyPart, setBusyPart] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(item: (typeof parts)[number]) {
    if (!auth.token) return;
    setBusyPart(item.part); setError(null);
    try {
      const response = await api.startPractice(auth.token, partPracticeCommand(item.part));
      router.push(`/practice/${response.data.id}`);
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") { await auth.signOut(); return; }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể bắt đầu bài luyện." : "Could not start practice."));
    } finally { setBusyPart(null); }
  }

  return <Screen>
    <Title>{vi ? "Luyện tập Part 1–7" : "Practice Parts 1–7"}</Title>
    <Muted>{vi ? "Cùng ngân hàng câu hỏi, lịch sử và chấm điểm với web. Nhóm câu và media được máy chủ chọn nguyên vẹn." : "Uses the same question bank, history and server scoring as web. Grouped questions and media stay intact."}</Muted>
    {error ? <ErrorBanner message={error} /> : null}
    {(["LISTENING", "READING"] as const).map((area) => <View key={area} style={styles.section}>
      <Text style={styles.heading}>{area}</Text>
      {parts.filter((item) => item.area === area).map((item) => <Card key={item.part}>
        <View style={styles.row}>
          <Text style={styles.part}>Part {item.part}</Text>
          <Text style={styles.count}>{item.count} {vi ? "câu mục tiêu" : "question target"}</Text>
        </View>
        <Muted>{vi ? item.vi : item.en}</Muted>
        <PrimaryButton busy={busyPart === item.part} disabled={busyPart !== null} label={vi ? `Luyện Part ${item.part}` : `Practice Part ${item.part}`} onPress={() => void start(item)} />
      </Card>)}
    </View>)}
  </Screen>;
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  heading: { color: colors.forest, fontSize: 14, fontWeight: "800", letterSpacing: 1.5 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.sm },
  part: { color: colors.ink, fontSize: 20, fontWeight: "800" },
  count: { color: colors.muted, fontSize: 13, fontWeight: "700" },
});
