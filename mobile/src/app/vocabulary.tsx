import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api, MobileApiError } from "@/api/client";
import type { VocabularyResponse } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { Card, ErrorBanner, Loading, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { dueVocabularyCards } from "@/lib/model";
import { colors, space } from "@/theme";

type VocabularyCard = VocabularyResponse["data"][number];

export default function VocabularyScreen() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [items, setItems] = useState<VocabularyCard[] | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState(0);
  const due = useMemo(() => dueVocabularyCards(items ?? [], loadedAt), [items, loadedAt]);
  const load = useCallback(async () => {
    if (!auth.token) return;
    setError(null);
    try { setItems((await api.vocabulary(auth.token)).data); setLoadedAt(Date.now()); }
    catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") { await auth.signOut(); return; }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể tải từ vựng." : "Could not load vocabulary."));
    }
  }, [auth, vi]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function review(id: string, remembered: boolean) {
    if (!auth.token) return;
    setBusy(id); setError(null);
    try { await api.reviewVocabulary(auth.token, id, { remembered }); setItems((current) => current?.filter((item) => item.id !== id) ?? null); }
    catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") { await auth.signOut(); return; }
      setError(cause instanceof Error ? cause.message : (vi ? "Chưa thể lưu lần ôn." : "Could not save this review."));
    } finally { setBusy(null); }
  }

  if (!items && !error) return <Screen><Loading label={vi ? "Đang tải từ vựng…" : "Loading vocabulary…"} /></Screen>;
  const scheduled = (items?.length ?? 0) - due.length;
  return <Screen>
    <Title>{vi ? "Ôn từ vựng" : "Vocabulary review"}</Title>
    <Muted>{vi ? `${due.length} từ đến hạn · ${scheduled} từ đã lên lịch. Lịch SRS được đồng bộ với web.` : `${due.length} due · ${scheduled} scheduled. The SRS schedule is shared with web.`}</Muted>
    {error ? <ErrorBanner message={error} retry={() => void load()} retryLabel={vi ? "Thử lại" : "Try again"} /> : null}
    {due.length ? due.map((item) => {
      const open = Boolean(revealed[item.id]);
      return <Card key={item.id}>
        <View style={styles.row}><Text style={styles.term}>{item.term}</Text><Text style={styles.part}>Part {item.toeicPart}</Text></View>
        <Text style={styles.context}>{item.contextSentence}</Text>
        {!open ? <Pressable accessibilityRole="button" onPress={() => setRevealed((current) => ({ ...current, [item.id]: true }))} style={({ pressed }) => [styles.reveal, pressed && styles.pressed]}><Text style={styles.revealText}>{vi ? "Hiện nghĩa" : "Reveal meaning"}</Text></Pressable> : <>
          <View accessibilityLiveRegion="polite" style={styles.meaning}><Text style={styles.meaningText}>{vi ? item.meaningVi : item.meaningEn}</Text>{vi && item.meaningEn !== item.meaningVi ? <Muted>{item.meaningEn}</Muted> : null}</View>
          <View style={styles.actions}><View style={styles.action}><PrimaryButton busy={busy === item.id} disabled={busy !== null} label={vi ? "Chưa nhớ" : "Again"} onPress={() => void review(item.id, false)} /></View><View style={styles.action}><PrimaryButton busy={busy === item.id} disabled={busy !== null} label={vi ? "Đã nhớ" : "Remembered"} onPress={() => void review(item.id, true)} /></View></View>
        </>}
      </Card>;
    }) : <Card><Text style={styles.done}>{vi ? "Đã ôn hết hôm nay" : "You are caught up"}</Text><Muted>{scheduled ? (vi ? "Các từ tiếp theo đã được lên lịch." : "Your next cards are already scheduled.") : (vi ? "Lưu từ mới từ kết quả luyện tập để bắt đầu." : "Save words from practice results to begin.")}</Muted></Card>}
  </Screen>;
}

const styles = StyleSheet.create({ row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: space.sm }, term: { color: colors.ink, fontSize: 26, fontWeight: "800", flex: 1 }, part: { color: colors.forest, fontSize: 14, fontWeight: "800" }, context: { color: colors.ink, fontSize: 17, lineHeight: 26 }, reveal: { minHeight: 48, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.forest, borderRadius: 12 }, revealText: { color: colors.forest, fontSize: 16, fontWeight: "800" }, pressed: { opacity: 0.72 }, meaning: { backgroundColor: colors.successSurface, padding: space.md, borderRadius: 12, gap: space.xs }, meaningText: { color: colors.ink, fontSize: 18, fontWeight: "700" }, actions: { flexDirection: "row", gap: space.sm }, action: { flex: 1 }, done: { color: colors.ink, fontSize: 19, fontWeight: "800" } });
