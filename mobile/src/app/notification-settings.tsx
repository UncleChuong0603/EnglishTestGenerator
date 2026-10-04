import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { StyleSheet, Switch, Text, View } from "react-native";
import { api, MobileApiError } from "@/api/client";
import type { NotificationPreferencesResponse, UpdateNotificationPreferencesRequest } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { Card, ErrorBanner, Loading, Muted, Screen, Title } from "@/components/ui";
import { registerNotifications, revokeNotifications } from "@/lib/notifications";
import { colors, space } from "@/theme";

type Preferences = NotificationPreferencesResponse["data"];
const labels: { key: Exclude<keyof Preferences, "enabled">; vi: string; en: string }[] = [
  { key: "todaysWorkout", vi: "Bài tập hôm nay", en: "Today’s Workout" },
  { key: "vocabularyDue", vi: "Từ vựng đến hạn", en: "Vocabulary due" },
  { key: "unresolvedReview", vi: "Câu sai chưa thành thạo", en: "Unresolved mistakes" },
  { key: "weeklyReview", vi: "Xem lại tuần", en: "Weekly review" },
  { key: "streak", vi: "Kèm chuỗi ngày học thật", en: "Include real streak" },
];

export default function NotificationSettings() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!auth.token) return;
    setError(null);
    try { setPreferences((await api.notificationPreferences(auth.token)).data); }
    catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") { await auth.signOut(); return; }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể tải cài đặt nhắc học." : "Could not load reminder settings."));
    }
  }, [auth, vi]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function save(next: UpdateNotificationPreferencesRequest, register = false) {
    if (!auth.token) return;
    setBusy(true); setError(null);
    try {
      if (register) await registerNotifications(auth.token);
      const saved = (await api.updateNotificationPreferences(auth.token, next)).data;
      setPreferences(saved);
      if (!saved.enabled) await revokeNotifications(auth.token);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (vi ? "Chưa thể lưu cài đặt." : "Could not save reminder settings."));
    } finally { setBusy(false); }
  }

  if (!preferences && !error) return <Screen><Loading label={vi ? "Đang tải nhắc học…" : "Loading reminders…"} /></Screen>;
  return <Screen>
    <Title>{vi ? "Nhắc học" : "Learning reminders"}</Title>
    <Muted>{vi ? "Chỉ bật khi bạn đồng ý. Máy chủ chọn tối đa một lời nhắc hữu ích mỗi ngày cho mỗi thiết bị; không tạo khẩn cấp hoặc điểm số giả." : "Opt in explicitly. The server sends at most one useful reminder per device each day—no fake urgency or score claims."}</Muted>
    {error ? <ErrorBanner message={error} retry={() => void load()} retryLabel={vi ? "Thử lại" : "Try again"} /> : null}
    {preferences ? <Card>
      <View style={styles.row}><View style={styles.copy}><Text style={styles.title}>{vi ? "Cho phép nhắc học" : "Allow reminders"}</Text><Muted>{vi ? "Bạn có thể tắt bất kỳ lúc nào." : "You can turn this off at any time."}</Muted></View><Switch accessibilityLabel={vi ? "Cho phép nhắc học" : "Allow reminders"} disabled={busy} onValueChange={(enabled) => void save({ ...preferences, enabled }, enabled)} trackColor={{ false: colors.rule, true: colors.forest }} value={preferences.enabled} /></View>
      {labels.map((item) => <View key={item.key} style={styles.row}><Text style={styles.label}>{vi ? item.vi : item.en}</Text><Switch accessibilityLabel={vi ? item.vi : item.en} disabled={busy || !preferences.enabled} onValueChange={(value) => void save({ ...preferences, [item.key]: value })} trackColor={{ false: colors.rule, true: colors.forest }} value={preferences[item.key]} /></View>)}
    </Card> : null}
  </Screen>;
}

const styles = StyleSheet.create({ row: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.md, borderBottomWidth: 1, borderBottomColor: colors.rule }, copy: { flex: 1 }, title: { color: colors.ink, fontSize: 19, fontWeight: "800" }, label: { color: colors.ink, fontSize: 16, lineHeight: 23, flex: 1 } });
