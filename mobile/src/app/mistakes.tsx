import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { api, MobileApiError } from "@/api/client";
import type { MistakesResponse } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { Card, ErrorBanner, Loading, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { colors, space } from "@/theme";

type Mistake = MistakesResponse["data"][number];

function reasonLabel(reason: Mistake["reasonCode"], vi: boolean) {
  const labels: Record<NonNullable<Mistake["reasonCode"]>, { vi: string; en: string }> = {
    VOCAB_UNKNOWN: { vi: "Thiếu từ vựng", en: "Vocabulary gap" },
    GRAMMAR_RULE: { vi: "Quy tắc ngữ pháp", en: "Grammar rule" },
    PARAPHRASE_MISSED: { vi: "Không nhận ra cách diễn đạt tương đương", en: "Missed paraphrase" },
    DISTRACTOR_TRAP: { vi: "Bẫy đáp án nhiễu", en: "Distractor trap" },
    MISHEARD_WORD: { vi: "Nghe nhầm hoặc bỏ lỡ từ", en: "Misheard word" },
    LOST_CONTEXT: { vi: "Mất mạch ngữ cảnh", en: "Lost context" },
    INFERENCE_ERROR: { vi: "Suy luận chưa đúng", en: "Inference error" },
    TIME_PRESSURE: { vi: "Áp lực thời gian", en: "Time pressure" },
    CARELESS: { vi: "Bất cẩn", en: "Careless" },
    OTHER: { vi: "Lý do khác", en: "Other" },
    UNKNOWN: { vi: "Chưa rõ", en: "Unknown" },
  };
  return reason ? labels[reason][vi ? "vi" : "en"] : (vi ? "Chưa chọn lý do" : "No reason selected");
}

export default function MistakesScreen() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [items, setItems] = useState<Mistake[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyPart, setBusyPart] = useState<number | null>(null);
  const load = useCallback(async () => {
    if (!auth.token) return;
    setError(null);
    try { setItems((await api.mistakes(auth.token)).data); }
    catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") { await auth.signOut(); return; }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể tải các câu cần ôn." : "Could not load your mistakes."));
    }
  }, [auth, vi]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function review(part: number) {
    if (!auth.token) return;
    setBusyPart(part); setError(null);
    try {
      const response = await api.startPractice(auth.token, { kind: "MASTERY_REVIEW", part: part as 1 | 2 | 3 | 4 | 5 | 6 | 7, size: 10, smart: false });
      router.push(`/practice/${response.data.id}`);
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") { await auth.signOut(); return; }
      setError(cause instanceof Error ? cause.message : (vi ? "Chưa thể tạo bài ôn." : "Could not start a review."));
    } finally { setBusyPart(null); }
  }

  if (!items && !error) return <Screen><Loading label={vi ? "Đang tải câu sai…" : "Loading mistakes…"} /></Screen>;
  return <Screen>
    <Title>{vi ? "Câu sai cần ôn" : "Mistake Bank"}</Title>
    <Muted>{vi ? "Các câu chưa thành thạo được đồng bộ với web. Ôn theo Part để củng cố đúng nhóm kỹ năng." : "Unmastered questions are shared with web. Review by Part to reinforce the right skill group."}</Muted>
    {error ? <ErrorBanner message={error} retry={() => void load()} retryLabel={vi ? "Thử lại" : "Try again"} /> : null}
    {items?.length ? items.map((item) => <Card key={item.questionId}>
      <View style={styles.row}><Text style={styles.part}>Part {item.part}</Text><Text style={styles.count}>{vi ? `Sai ${item.wrongCount} lần` : `${item.wrongCount} misses`}</Text></View>
      <Text style={styles.skill}>{item.skill}</Text>
      <Muted>{item.subSkill} · {reasonLabel(item.reasonCode, vi)}</Muted>
      <PrimaryButton busy={busyPart === item.part} disabled={!item.available || busyPart !== null} label={vi ? `Ôn Part ${item.part}` : `Review Part ${item.part}`} onPress={() => void review(item.part)} />
      {!item.available ? <Muted>{vi ? "Câu gốc hiện không khả dụng trong ngân hàng." : "The source question is not currently available."}</Muted> : null}
    </Card>) : <Card><Text style={styles.emptyTitle}>{vi ? "Không còn câu sai cần ôn" : "No mistakes due for review"}</Text><Muted>{vi ? "Tiếp tục luyện tập; câu sai mới sẽ xuất hiện ở đây." : "Keep practicing; new misses will appear here."}</Muted></Card>}
  </Screen>;
}

const styles = StyleSheet.create({ row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: space.sm }, part: { color: colors.forest, fontSize: 18, fontWeight: "800" }, count: { color: colors.danger, fontSize: 14, fontWeight: "700" }, skill: { color: colors.ink, fontSize: 18, fontWeight: "800" }, emptyTitle: { color: colors.ink, fontSize: 19, fontWeight: "800" } });
