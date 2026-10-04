import { useEffect, useState } from "react";
import { router, type Href } from "expo-router";
import { api, MobileApiError } from "@/api/client";
import { useAuth } from "@/auth/auth-context";
import { ErrorBanner, Loading, Screen } from "@/components/ui";
import { dashboardAction } from "@/lib/model";

export default function WorkoutDeepLink() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!auth.token) return;
    let active = true;
    void (async () => {
      try {
        const dashboard = (await api.dashboard(auth.token!)).data;
        const action = dashboardAction(dashboard);
        if (!active) return;
        if (action.kind === "RESUME") router.replace(`/practice/${action.sessionId}`);
        else if (action.kind === "PROGRESS") router.replace("/(tabs)/progress");
        else router.replace(`/practice/${(await api.startPractice(auth.token!, { kind: "TODAYS_WORKOUT" })).data.id}`);
      } catch (cause) {
        if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") { await auth.signOut(); return; }
        if (active) setError(cause instanceof Error ? cause.message : (vi ? "Chưa thể mở bài tập." : "Could not open the workout."));
      }
    })();
    return () => { active = false; };
  }, [auth, vi]);
  return <Screen>{error ? <ErrorBanner message={error} retry={() => router.replace("/workout" as Href)} retryLabel={vi ? "Thử lại" : "Try again"} /> : <Loading label={vi ? "Đang chuẩn bị bài tập…" : "Preparing your workout…"} />}</Screen>;
}
