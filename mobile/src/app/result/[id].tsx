import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  const [savingReason, setSavingReason] = useState<string | null>(null);
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [startingRemediation, setStartingRemediation] = useState<string | null>(null);
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
  const saveReason = async (questionId: string, reasonCode: NonNullable<PracticeResult["results"][number]["mistakeReason"]>["choices"][number]["code"]) => {
    if (!auth.token || !id) return;
    if (reasonCode === "UNKNOWN") return;
    setSavingReason(questionId); setReasonError(null);
    try {
      await api.saveMistakeReason(auth.token, id, { questionId, reasonCode });
      setResult((current) => current ? { ...current, results: current.results.map((item) => item.questionId === questionId && item.mistakeReason ? { ...item, mistakeReason: { ...item.mistakeReason, selected: reasonCode, evidenceSource: "USER_SELECTED" } } : item) } : current);
    } catch (cause) {
      setReasonError(cause instanceof Error ? cause.message : (vi ? "Chưa thể lưu lý do." : "Could not save the reason."));
    } finally { setSavingReason(null); }
  };
  const startRemediation = async (questionId: string) => {
    if (!auth.token || !id) return;
    setStartingRemediation(questionId); setError(null);
    try {
      const response = await api.startRemediation(auth.token, id, { questionId });
      router.push(`/practice/${response.data.id}`);
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") { await auth.signOut(); return; }
      setError(cause instanceof Error ? cause.message : (vi ? "Chưa thể tạo bài ôn." : "Could not start the review."));
      setStartingRemediation(null);
    }
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
          {!item.isCorrect && item.mistakeReason ? <View style={styles.reasonSection}>
            <Text style={styles.reasonTitle}>{vi ? "Bạn nghĩ mình sai vì đâu?" : "Why do you think you missed this?"}</Text>
            <Muted>{vi ? "Không bắt buộc. Chọn một lý do hoặc bỏ qua." : "Optional. Choose a reason or skip it."}</Muted>
            <View style={styles.reasonChoices}>
              {item.mistakeReason.choices.map((choice) => {
                const selected = item.mistakeReason?.selected === choice.code;
                return <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected, busy: savingReason === item.questionId }}
                  disabled={savingReason === item.questionId}
                  key={choice.code}
                  onPress={() => void saveReason(item.questionId, choice.code)}
                  style={({ pressed }) => [styles.reasonChoice, selected && styles.reasonChoiceSelected, pressed && styles.reasonChoicePressed]}
                ><Text style={[styles.reasonChoiceText, selected && styles.reasonChoiceTextSelected]}>{choice.label[vi ? "vi" : "en"]}{choice.suggested ? (vi ? " · gợi ý" : " · suggested") : ""}</Text></Pressable>;
              })}
            </View>
            {savingReason === item.questionId ? <Muted>{vi ? "Đang lưu…" : "Saving…"}</Muted> : null}
            <PrimaryButton
              busy={startingRemediation === item.questionId}
              label={vi ? "Học ngắn + luyện 3–5 câu" : "Micro lesson + 3–5 questions"}
              onPress={() => void startRemediation(item.questionId)}
            />
          </View> : null}
        </Card>
      ))}
      {error ? <ErrorBanner message={error} /> : reasonError ? <ErrorBanner message={reasonError} /> : null}
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
  reasonSection: { borderTopWidth: 1, borderTopColor: colors.rule, gap: space.sm, marginTop: space.md, paddingTop: space.md },
  reasonTitle: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  reasonChoices: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  reasonChoice: { minHeight: 48, justifyContent: "center", borderWidth: 1, borderColor: colors.rule, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface },
  reasonChoiceSelected: { borderColor: colors.forest, backgroundColor: colors.forest },
  reasonChoicePressed: { opacity: 0.72 },
  reasonChoiceText: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  reasonChoiceTextSelected: { color: colors.paper },
});
