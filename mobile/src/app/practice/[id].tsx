import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api, MobileApiError } from "@/api/client";
import type { PracticeSession } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { QuestionMedia } from "@/components/question-media";
import { Card, ErrorBanner, Loading, PrimaryButton, Screen } from "@/components/ui";
import { colors, radius, space } from "@/theme";

export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!auth.token || !id) return;
    setError(null);
    try {
      const response = await api.practice(auth.token, id);
      if (response.data.status === "submitted") {
        router.replace(`/result/${id}`);
        return;
      }
      setSession(response.data);
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") {
        await auth.signOut();
        return;
      }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể tải bài luyện." : "Could not load this practice."));
    }
  }, [auth, id, vi]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const question = session?.questions[index];
  const group = question ? session?.groups.find((item) => item.questionIds.includes(question.id)) : null;
  const answered = session?.questions.filter((item) => item.selectedOptionId).length ?? 0;

  async function choose(selectedOptionId: string) {
    if (!auth.token || !session || !question || saving) return;
    const previous = question.selectedOptionId;
    setSession({
      ...session,
      questions: session.questions.map((item) => item.id === question.id ? { ...item, selectedOptionId } : item),
    });
    setSaving(true);
    setError(null);
    try {
      await api.answer(auth.token, session.id, { questionId: question.id, selectedOptionId });
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") {
        await auth.signOut();
        return;
      }
      setSession({
        ...session,
        questions: session.questions.map((item) => item.id === question.id ? { ...item, selectedOptionId: previous } : item),
      });
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể lưu câu trả lời." : "Could not save your answer."));
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    if (!auth.token || !session) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.submit(auth.token, session.id);
      router.replace(`/result/${session.id}`);
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") {
        await auth.signOut();
        return;
      }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể nộp bài." : "Could not submit this practice."));
    } finally {
      setSubmitting(false);
    }
  }

  if (!session || !question) {
    return <Screen>{error ? <ErrorBanner message={error} retry={() => void load()} retryLabel={vi ? "Thử lại" : "Try again"} /> : <Loading label={vi ? "Đang tải dữ liệu…" : "Loading practice…"} />}</Screen>;
  }

  return (
    <Screen>
      <View style={styles.progressRow}>
        <Text style={styles.progress}>{vi ? `Câu ${index + 1}/${session.questionCount}` : `Question ${index + 1}/${session.questionCount}`}</Text>
        <Text style={styles.saved}>{saving ? (vi ? "Đang lưu…" : "Saving…") : (vi ? `${answered} đã trả lời` : `${answered} answered`)}</Text>
      </View>
      <View
        accessibilityLabel={vi ? `Tiến độ ${Math.round(((index + 1) / session.questionCount) * 100)}%` : `Progress ${Math.round(((index + 1) / session.questionCount) * 100)}%`}
        accessibilityRole="progressbar"
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${((index + 1) / session.questionCount) * 100}%` }]} />
      </View>
      {group?.passages.map((passage) => (
        <Card key={passage.id}>
          {passage.title ? <Text style={styles.passageTitle}>{passage.title}</Text> : null}
          <Text selectable style={styles.passage}>{passage.content}</Text>
        </Card>
      ))}
      <Card>
        <Text style={styles.part}>Part {question.part} · {question.skill}</Text>
        <QuestionMedia key={question.media?.map((item) => item.id).join(":") ?? question.id} media={question.media} vi={vi} />
        <Text selectable style={styles.question}>
          {question.text || (vi ? "Nghe audio và chọn đáp án phù hợp." : "Listen to the audio and choose the best answer.")}
        </Text>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {question.options.map((option) => {
            const selected = question.selectedOptionId === option.id;
            return (
              <Pressable
                accessibilityLabel={`${option.key}. ${option.text}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled: saving }}
                disabled={saving}
                key={option.id}
                onPress={() => void choose(option.id)}
                style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.optionPressed]}
              >
                <View style={[styles.key, selected && styles.keySelected]}>
                  <Text style={[styles.keyText, selected && styles.selectedText]}>{option.key}</Text>
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.text}</Text>
                {selected ? <Ionicons color={colors.forest} name="checkmark-circle" size={24} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Card>
      {error ? <ErrorBanner message={error} /> : null}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: index === 0 }}
          disabled={index === 0}
          onPress={() => setIndex((value) => Math.max(0, value - 1))}
          style={({ pressed }) => [styles.secondary, (pressed || index === 0) && styles.disabled]}
        >
          <Text style={styles.secondaryText}>{vi ? "Câu trước" : "Previous"}</Text>
        </Pressable>
        {index < session.questionCount - 1 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setIndex((value) => Math.min(session.questionCount - 1, value + 1))}
            style={({ pressed }) => [styles.secondary, pressed && styles.disabled]}
          >
            <Text style={styles.secondaryText}>{vi ? "Câu tiếp" : "Next"}</Text>
          </Pressable>
        ) : (
          <View style={styles.flex}>
            <PrimaryButton
              busy={submitting}
              label={answered < session.questionCount
                ? (vi ? `Nộp bài (${answered}/${session.questionCount})` : `Submit (${answered}/${session.questionCount})`)
                : (vi ? "Nộp bài" : "Submit")}
              onPress={() => void submit()}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progress: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  saved: { color: colors.muted, fontSize: 14 },
  track: { height: 8, backgroundColor: colors.rule, borderRadius: 99, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.forest },
  part: { color: colors.forest, fontWeight: "800", fontSize: 14 },
  question: { color: colors.ink, fontSize: 20, lineHeight: 30, fontWeight: "700" },
  passageTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  passage: { color: colors.ink, fontSize: 17, lineHeight: 27 },
  options: { gap: space.sm, marginTop: space.sm },
  option: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.rule, borderRadius: radius.md, padding: 12, backgroundColor: colors.surface },
  optionSelected: { borderColor: colors.forest, backgroundColor: "#edf5f0" },
  optionPressed: { opacity: 0.7 },
  key: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.rule, justifyContent: "center", alignItems: "center" },
  keySelected: { borderColor: colors.forest, backgroundColor: colors.forest },
  keyText: { color: colors.ink, fontWeight: "800" },
  selectedText: { color: "#fff" },
  optionText: { flex: 1, color: colors.ink, fontSize: 16, lineHeight: 23 },
  optionTextSelected: { fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12 },
  secondary: { minHeight: 48, minWidth: 112, flex: 1, borderWidth: 1, borderColor: colors.forest, borderRadius: radius.md, justifyContent: "center", alignItems: "center", paddingHorizontal: 14 },
  secondaryText: { color: colors.forest, fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.38 },
  flex: { flex: 1 },
});
