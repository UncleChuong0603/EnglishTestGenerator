import type { CreatePracticeRequest, DashboardResponse, EntitlementsResponse, PracticeResult, PracticeSession, VocabularyResponse } from "@/api/types";

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

export function partPracticeCommand(part: 1 | 2 | 3 | 4 | 5 | 6 | 7): CreatePracticeRequest {
  if (part <= 4) {
    const counts = { 1: 5, 2: 10, 3: 3, 4: 3 } as const;
    return { kind: "CUSTOM", skillArea: "LISTENING", part: part as 1 | 2 | 3 | 4, questionCount: counts[part as keyof typeof counts] };
  }
  return { kind: "CUSTOM", skillArea: "READING", part: part as 5 | 6 | 7, questionCount: 10 };
}

export function dueVocabularyCards(cards: VocabularyResponse["data"], nowMs: number) {
  return cards.filter((card) => new Date(card.dueAt).getTime() <= nowMs);
}

export function shouldClearSession(code: string) { return code === "UNAUTHENTICATED"; }
export function shouldRetryNetwork(code: string) { return code === "NETWORK_ERROR" || code === "TIMEOUT"; }
