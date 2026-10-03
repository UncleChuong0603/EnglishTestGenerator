import type { DashboardResponse, EntitlementsResponse, PracticeResult, PracticeSession } from "@/api/types";

export function dashboardAction(dashboard: DashboardResponse["data"]) {
  if (dashboard.resumablePractice) return { kind: "RESUME" as const, sessionId: dashboard.resumablePractice.id };
  if (dashboard.dailyGoal.complete) return { kind: "PROGRESS" as const };
  return { kind: "START" as const };
}

export function workoutBlocked(entitlements: EntitlementsResponse["data"], dashboard: DashboardResponse["data"]) {
  const usage = entitlements.usage.TODAYS_WORKOUT;
  return !dashboard.resumablePractice && usage.type === "LIMITED" && usage.remaining === 0;
}

export function selectAnswer(session: PracticeSession, questionId: string, selectedOptionId: string): PracticeSession {
  return { ...session, questions: session.questions.map((question) => question.id === questionId ? { ...question, selectedOptionId } : question) };
}

export function resultAccuracy(result: PracticeResult) {
  return Math.round((result.scoreCorrect / result.scoreTotal) * 100);
}

export function shouldClearSession(code: string) { return code === "UNAUTHENTICATED"; }
export function shouldRetryNetwork(code: string) { return code === "NETWORK_ERROR" || code === "TIMEOUT"; }
