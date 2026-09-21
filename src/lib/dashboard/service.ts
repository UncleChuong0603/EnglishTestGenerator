import "server-only";
import { loadRecommendedWorkoutFromProgress } from "@/lib/diagnosis/service";
import type { WorkoutRecommendation } from "@/lib/diagnosis/types";
import { getToeicProgress } from "@/lib/progress/queries";
import type { ToeicProgress } from "@/lib/progress/types";
import { hasCompletedDiagnostic, shouldRecommendDiagnostic } from "@/lib/diagnostic/service";
import { and, desc, eq, gt, isNotNull, isNull, ne, notInArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, diagnosticRuns, practiceSessions } from "@/db/schema";
import { getMistakeOverview, type MistakeOverview } from "@/lib/mastery/queries";
import { getDailyUsageWindow } from "@/lib/entitlements/catalog";

export type ResumablePractice = { id: string; source: string; part: number | null; questionCount: number };
export type DashboardData = { progress: ToeicProgress; recommendation: WorkoutRecommendation | null; recommendDiagnostic: boolean; activeDiagnosticId: string | null; mistakes: MistakeOverview; completedQuestionsToday: number; completedLearningSessions: number; resumablePractice: ResumablePractice | null };

/** Counts distinct submitted answers from ordinary learning sessions in the canonical product day. */
export async function getDailyLearningState(userId: string, now = new Date()) {
  const window = getDailyUsageWindow(now);
  const [progressRows, resumableRows] = await Promise.all([
    db.select({
      completed: sql<number>`count(distinct ${attemptAnswers.id}) filter (where coalesce(${attemptAnswers.answeredAt}, ${attemptAnswers.createdAt}) >= ${window.start} and coalesce(${attemptAnswers.answeredAt}, ${attemptAnswers.createdAt}) < ${window.resetAt})::int`,
      completedSessions: sql<number>`count(distinct ${practiceSessions.id})::int`,
    }).from(attemptAnswers)
      .innerJoin(practiceSessions, and(eq(practiceSessions.id, attemptAnswers.sessionId), eq(practiceSessions.userId, attemptAnswers.userId)))
      .where(and(
        eq(attemptAnswers.userId, userId),
        eq(practiceSessions.status, "submitted"),
        notInArray(practiceSessions.source, ["diagnostic", "full_mock", "ranked_challenge"]),
        ne(practiceSessions.practiceType, "demo_test"),
        isNotNull(attemptAnswers.answeredAt),
      )),
    db.select({ id: practiceSessions.id, source: practiceSessions.source, part: practiceSessions.part, questionCount: practiceSessions.questionCount })
      .from(practiceSessions)
      .where(and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.status, "in_progress"),
        notInArray(practiceSessions.source, ["diagnostic", "full_mock", "ranked_challenge"]),
        ne(practiceSessions.practiceType, "demo_test"),
        or(isNull(practiceSessions.expiresAt), gt(practiceSessions.expiresAt, now)),
      ))
      .orderBy(desc(practiceSessions.startedAt))
      .limit(1),
  ]);
  return {
    completedQuestionsToday: Number(progressRows[0]?.completed ?? 0),
    completedLearningSessions: Number(progressRows[0]?.completedSessions ?? 0),
    resumablePractice: resumableRows[0] ?? null,
  };
}

/** One progress aggregate is shared with diagnosis; no question content/media is loaded. */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [progress, completed, active, mistakes, daily] = await Promise.all([getToeicProgress(userId), hasCompletedDiagnostic(userId), db.select({ id: diagnosticRuns.id }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, userId), eq(diagnosticRuns.status, "IN_PROGRESS"), gt(diagnosticRuns.expiresAt, new Date()))).limit(1), getMistakeOverview(userId), getDailyLearningState(userId)]);
  let recommendation: WorkoutRecommendation | null = null;
  try { recommendation = await loadRecommendedWorkoutFromProgress(userId, progress); }
  catch (error) { console.error("Could not load dashboard recommendation", error); }
  return { progress, recommendation, recommendDiagnostic: shouldRecommendDiagnostic(progress, completed), activeDiagnosticId: active[0]?.id ?? null, mistakes, ...daily };
}
