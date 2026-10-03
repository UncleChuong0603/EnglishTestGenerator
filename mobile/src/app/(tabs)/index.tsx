import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { api, MobileApiError } from "@/api/client";
import type { DashboardResponse, EntitlementsResponse, PlanResponse } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { Card, ErrorBanner, Loading, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { dashboardAction, workoutBlocked } from "@/lib/model";
import { colors, space } from "@/theme";

type HomeData = {
  dashboard: DashboardResponse["data"];
  plan: PlanResponse["data"];
  entitlements: EntitlementsResponse["data"];
};

export default function Home() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    if (!auth.token) return;
    setError(null);
    try {
      const [dashboard, plan, entitlements] = await Promise.all([
        api.dashboard(auth.token),
        api.plan(auth.token),
        api.entitlements(auth.token),
      ]);
      setData({ dashboard: dashboard.data, plan: plan.data, entitlements: entitlements.data });
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") {
        await auth.signOut();
        return;
      }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể tải trang chủ." : "Could not load the home screen."));
    }
  }, [auth, vi]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function takeNextAction() {
    if (!auth.token || !data) return;
    const action = dashboardAction(data.dashboard);
    if (action.kind === "RESUME") {
      router.push(`/practice/${action.sessionId}`);
      return;
    }
    if (action.kind === "PROGRESS") {
      router.navigate("/(tabs)/progress");
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const response = await api.startPractice(auth.token, { kind: "TODAYS_WORKOUT" });
      router.push(`/practice/${response.data.id}`);
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") {
        await auth.signOut();
        return;
      }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể bắt đầu bài tập." : "Could not start the workout."));
    } finally {
      setStarting(false);
    }
  }

  if (!data && !error) return <Screen><Loading label={vi ? "Đang tải trang chủ…" : "Loading home…"} /></Screen>;
  const d = data?.dashboard;
  const action = d ? dashboardAction(d) : null;
  const blocked = data && d ? workoutBlocked(data.entitlements, d) : false;
  const actionLabel = action?.kind === "RESUME"
    ? (vi ? "Tiếp tục bài đang làm" : "Resume practice")
    : action?.kind === "PROGRESS"
      ? (vi ? "Xem tiến độ" : "View progress")
      : (vi ? "Bắt đầu bài tập" : "Start workout");

  return (
    <Screen>
      <View>
        <Text style={styles.eyebrow}>TOEIC GYM</Text>
        <Title>{vi ? `Chào ${auth.me?.profile.displayName ?? "bạn"}` : `Hello ${auth.me?.profile.displayName ?? "learner"}`}</Title>
      </View>
      {error ? <ErrorBanner message={error} retry={() => void load()} retryLabel={vi ? "Thử lại" : "Try again"} /> : null}
      {d && data ? (
        <>
          <Card>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{vi ? "Bài tập hôm nay" : "Today’s workout"}</Text>
                <Muted>{d.recommendation
                  ? `${d.recommendation.skillArea === "READING" ? "Reading" : "Listening"}${d.recommendation.part ? ` · Part ${d.recommendation.part}` : ""}${d.recommendation.subSkill ? ` · ${d.recommendation.subSkill}` : ""}`
                  : (vi ? "Máy chủ sẽ chọn bước phù hợp tiếp theo." : "The server will choose your next useful step.")}</Muted>
              </View>
              <Text style={styles.pill}>{data.entitlements.effectivePlan}{data.entitlements.isTrial ? " · TRIAL" : ""}</Text>
            </View>
            <PrimaryButton busy={starting} disabled={blocked} label={actionLabel} onPress={() => void takeNextAction()} />
            {blocked ? <Text style={styles.limit}>{vi ? "Bạn đã hoàn thành lượt Today’s Workout hôm nay." : "Today’s Workout limit reached for today."}</Text> : null}
          </Card>
          <Card>
            <Text style={styles.cardTitle}>{vi ? "Mục tiêu hằng ngày" : "Daily goal"}</Text>
            <Text style={styles.metric}>{d.dailyGoal.completedQuestions}/{d.dailyGoal.targetQuestions}</Text>
            <View accessibilityLabel={vi ? `Tiến độ ${d.dailyGoal.percent}%` : `Progress ${d.dailyGoal.percent}%`} accessibilityRole="progressbar" style={styles.track}>
              <View style={[styles.fill, { width: `${d.dailyGoal.percent}%` }]} />
            </View>
            <Muted>{d.dailyGoal.complete
              ? (vi ? "Đã hoàn thành. Bước hữu ích tiếp theo là xem lại tiến độ." : "Complete. Review your progress next.")
              : (vi ? `Còn ${d.dailyGoal.remainingQuestions} câu.` : `${d.dailyGoal.remainingQuestions} questions left.`)}</Muted>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>{vi ? "Đường tới mục tiêu" : "Road to target"}</Text>
            {d.goal?.targetScore
              ? <Text style={styles.metric}>{d.goal.targetScore}</Text>
              : <Muted>{vi ? "Chưa đặt mục tiêu điểm. Bạn có thể đặt trên web trong Cài đặt." : "No target yet. Set one on the web in Settings."}</Muted>}
            <Muted>{d.progress.answered
              ? `${d.progress.correct}/${d.progress.answered} · ${d.progress.accuracy ?? 0}%`
              : (vi ? "Làm bài đầu tiên để tạo đường tiến bộ." : "Complete your first practice to start tracking progress.")}</Muted>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>{vi ? "Kế hoạch tuần" : "Weekly plan"}</Text>
            {data.plan.items.length ? data.plan.items.slice(0, 4).map((item) => (
              <View key={item.slot} style={styles.planRow}>
                <Text style={styles.slot}>{item.slot}</Text>
                <View style={styles.flex}>
                  <Text style={styles.planTitle}>{item.activity.replaceAll("_", " ")}</Text>
                  <Muted>{item.minutes} {vi ? "phút" : "min"} · {item.completed ? (vi ? "Đã xong" : "Complete") : item.available ? (vi ? "Sẵn sàng" : "Ready") : (vi ? "Chưa sẵn sàng" : "Unavailable")}</Muted>
                </View>
              </View>
            )) : <Muted>{vi ? "Kế hoạch sẽ xuất hiện khi có hoạt động phù hợp." : "Your plan will appear when an activity is available."}</Muted>}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.forest, fontSize: 13, fontWeight: "800", letterSpacing: 2, marginBottom: space.sm },
  row: { flexDirection: "row", gap: space.sm, alignItems: "flex-start" },
  flex: { flex: 1 },
  cardTitle: { color: colors.ink, fontSize: 20, lineHeight: 27, fontWeight: "800" },
  pill: { color: colors.forest, borderColor: colors.forest, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, fontSize: 12, fontWeight: "800" },
  metric: { color: colors.ink, fontSize: 28, fontWeight: "800" },
  track: { height: 10, borderRadius: 99, backgroundColor: colors.rule, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.forest },
  limit: { color: colors.warm, lineHeight: 22 },
  planRow: { flexDirection: "row", alignItems: "center", gap: 12, borderTopColor: colors.rule, borderTopWidth: 1, paddingTop: 12 },
  slot: { width: 32, height: 32, textAlign: "center", textAlignVertical: "center", borderRadius: 16, backgroundColor: colors.paper, color: colors.forest, fontWeight: "800" },
  planTitle: { color: colors.ink, fontSize: 16, fontWeight: "700" },
});
