import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { api, MobileApiError } from "@/api/client";
import type { PracticeResult } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { Card, ErrorBanner, Loading, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { colors, space } from "@/theme";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!auth.token || !id) return;
    setError(null);
    try {
      const response = await api.practice(auth.token, id);
      if (response.data.status === "in_progress") {
        router.replace(`/practice/${id}`);
        return;
      }
      setResult(response.data);
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") {
        await auth.signOut();
        return;
      }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể tải kết quả." : "Could not load the result."));
    }
  }, [auth, id, vi]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!result) {
    return <Screen>{error ? <ErrorBanner message={error} retry={() => void load()} retryLabel={vi ? "Thử lại" : "Try again"} /> : <Loading label={vi ? "Đang tải kết quả…" : "Loading result…"} />}</Screen>;
  }
  const accuracy = Math.round((result.scoreCorrect / result.scoreTotal) * 100);
  const explanationLanguage = auth.me?.profile.explanationLanguage ?? "both";
  const explanation = (item: PracticeResult["results"][number]) => {
    if (explanationLanguage === "en") return item.explanationEn ?? item.explanationVi;
    if (explanationLanguage === "vi") return item.explanationVi ?? item.explanationEn;
    return [item.explanationVi, item.explanationEn].filter((value, index, all) => value && all.indexOf(value) === index).join("\n\n");
  };

  return (
    <Screen>
      <View>
        <Text style={styles.eyebrow}>{vi ? "ĐÃ ĐỒNG BỘ" : "SYNCED"}</Text>
        <Title>{vi ? `${result.scoreCorrect}/${result.scoreTotal} câu đúng` : `${result.scoreCorrect}/${result.scoreTotal} correct`}</Title>
        <Text style={styles.accuracy}>{vi ? "Độ chính xác" : "Accuracy"} {accuracy}%</Text>
      </View>
      <Card>
        <Muted>{vi ? "Kết quả đã được lưu vào cùng lịch sử học tập với web. Dashboard và Tiến độ sẽ hiển thị hoạt động này." : "This result is saved to the same learning history as the web app. Dashboard and Progress now include it."}</Muted>
      </Card>
      {result.results.map((item) => (
        <Card key={item.questionId}>
          <View style={styles.status}>
            <Ionicons color={item.isCorrect ? colors.success : colors.danger} name={item.isCorrect ? "checkmark-circle" : "close-circle"} size={24} />
            <Text style={[styles.statusText, { color: item.isCorrect ? colors.success : colors.danger }]}>
              {vi ? `Câu ${item.number} · ${item.isCorrect ? "Đúng" : "Chưa đúng"}` : `Question ${item.number} · ${item.isCorrect ? "Correct" : "Incorrect"}`}
            </Text>
          </View>
          {item.text ? <Text style={styles.question}>{item.text}</Text> : null}
          {item.options.map((option) => {
            const chosen = option.id === item.selectedOptionId;
            const correct = option.id === item.correctOptionId;
            return (
              <View key={option.id} style={styles.option}>
                <Text style={styles.optionText}>{option.key}. {option.text}</Text>
                {correct ? <Text style={styles.correct}>{vi ? "Đáp án đúng" : "Correct answer"}</Text> : chosen ? <Text style={styles.chosen}>{vi ? "Bạn chọn" : "Your answer"}</Text> : null}
              </View>
            );
          })}
          <Text style={styles.explanation}>{explanation(item) || (vi ? "Chưa có giải thích cho câu này." : "No explanation is available for this question.")}</Text>
        </Card>
      ))}
      {error ? <ErrorBanner message={error} /> : null}
      <PrimaryButton label={vi ? "Về trang chủ" : "Back to home"} onPress={() => router.replace("/(tabs)")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.forest, fontWeight: "800", letterSpacing: 2, marginBottom: space.sm },
  accuracy: { color: colors.muted, fontSize: 18, marginTop: space.sm },
  status: { flexDirection: "row", alignItems: "center", gap: space.sm },
  statusText: { fontWeight: "800", fontSize: 17 },
  question: { color: colors.ink, fontSize: 18, lineHeight: 27, fontWeight: "700" },
  option: { minHeight: 44, borderTopWidth: 1, borderTopColor: colors.rule, justifyContent: "center", paddingVertical: 8 },
  optionText: { color: colors.ink, fontSize: 16, lineHeight: 23 },
  correct: { color: colors.success, fontWeight: "700" },
  chosen: { color: colors.danger, fontWeight: "700" },
  explanation: { color: colors.muted, fontSize: 16, lineHeight: 25, marginTop: space.sm },
});
