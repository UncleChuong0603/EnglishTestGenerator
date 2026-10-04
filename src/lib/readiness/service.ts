import "server-only";

import { and, eq, gte, lt, max, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  attemptAnswers,
  diagnosticRuns,
  fullMockRuns,
  practiceSessions,
  weeklyPlanSnapshots,
} from "@/db/schema";
import { getUsageStatus } from "@/lib/entitlements/service";
import { getLearnerGoal } from "@/lib/goals/service";
import { getMistakeCounts } from "@/lib/mastery/queries";
import { getToeicProgress } from "@/lib/progress/queries";
import type { ToeicProgress } from "@/lib/progress/types";
import { activityForSession, productWeekWindow, type PlanActivity } from "@/lib/weekly-plan/policy";
import { buildExamReadiness } from "./policy";

const planActivities = new Set<PlanActivity>([
  "WORKOUT",
  "FOCUSED_READING",
  "REVIEW",
  "READING",
  "LISTENING",
  "MOCK_LISTENING",
]);

export async function getExamReadiness(
  userId: string,
  options: { now?: Date; progress?: ToeicProgress } = {},
) {
  const now = options.now ?? new Date();
  const week = productWeekWindow(now);
  const historyStart = new Date(now.getTime() - 28 * 86_400_000);
  const weekStart = new Date(week.start.getTime() + 7 * 3_600_000).toISOString().slice(0, 10);

  const [progress, goal, usage, mistakes, learning, diagnostic, mocks, snapshot, sessions, listeningMocks] = await Promise.all([
    options.progress ? Promise.resolve(options.progress) : getToeicProgress(userId),
    getLearnerGoal(userId),
    getUsageStatus(userId, now),
    getMistakeCounts(userId),
    db.select({
      days: sql<number>`count(distinct to_char(timezone('Asia/Ho_Chi_Minh', coalesce(${attemptAnswers.answeredAt}, ${attemptAnswers.createdAt})), 'YYYY-MM-DD'))::int`,
    }).from(attemptAnswers)
      .innerJoin(practiceSessions, and(eq(practiceSessions.id, attemptAnswers.sessionId), eq(practiceSessions.userId, attemptAnswers.userId)))
      .leftJoin(diagnosticRuns, eq(diagnosticRuns.id, practiceSessions.diagnosticRunId))
      .leftJoin(fullMockRuns, eq(fullMockRuns.id, practiceSessions.fullMockRunId))
      .where(and(
        eq(attemptAnswers.userId, userId),
        eq(practiceSessions.status, "submitted"),
        gte(sql`coalesce(${attemptAnswers.answeredAt}, ${attemptAnswers.createdAt})`, historyStart),
        sql`(${practiceSessions.source} <> 'diagnostic' or ${diagnosticRuns.status} = 'COMPLETED')`,
        sql`(${practiceSessions.source} <> 'full_mock' or ${fullMockRuns.status} = 'COMPLETED')`,
      )),
    db.select({ completedAt: max(diagnosticRuns.completedAt) }).from(diagnosticRuns)
      .where(and(eq(diagnosticRuns.userId, userId), eq(diagnosticRuns.status, "COMPLETED"))),
    db.select({
      completed: sql<number>`count(*)::int`,
      latestCompletedAt: max(fullMockRuns.completedAt),
    }).from(fullMockRuns).where(and(eq(fullMockRuns.userId, userId), eq(fullMockRuns.status, "COMPLETED"))),
    db.select({ items: weeklyPlanSnapshots.items }).from(weeklyPlanSnapshots)
      .where(and(eq(weeklyPlanSnapshots.userId, userId), eq(weeklyPlanSnapshots.weekStart, weekStart))).limit(1),
    db.select({
      source: practiceSessions.source,
      skillArea: practiceSessions.skillArea,
      part: practiceSessions.part,
      completed: sql<number>`count(*)::int`,
    }).from(practiceSessions).where(and(
      eq(practiceSessions.userId, userId),
      eq(practiceSessions.status, "submitted"),
      gte(practiceSessions.submittedAt, week.start),
      lt(practiceSessions.submittedAt, week.end),
      notInArray(practiceSessions.source, ["diagnostic", "full_mock", "ranked_challenge"]),
      sql`${practiceSessions.practiceType} <> 'demo_test'`,
    )).groupBy(practiceSessions.source, practiceSessions.skillArea, practiceSessions.part),
    db.select({ completed: sql<number>`count(*)::int` }).from(fullMockRuns).where(and(
      eq(fullMockRuns.userId, userId),
      eq(fullMockRuns.status, "COMPLETED"),
      eq(fullMockRuns.mode, "LISTENING"),
      gte(fullMockRuns.completedAt, week.start),
      lt(fullMockRuns.completedAt, week.end),
    )),
  ]);

  const completedByActivity = new Map<PlanActivity, number>();
  for (const row of sessions) {
    const activity = activityForSession(row.source, row.skillArea, row.part);
    if (activity) completedByActivity.set(activity, (completedByActivity.get(activity) ?? 0) + Number(row.completed));
  }
  completedByActivity.set("MOCK_LISTENING", Number(listeningMocks[0]?.completed ?? 0));
  const planned = (snapshot[0]?.items ?? []).flatMap((item) => planActivities.has(item.activity as PlanActivity) ? [item.activity as PlanActivity] : []);
  let completedPlanItems = 0;
  for (const activity of planned) {
    const remaining = completedByActivity.get(activity) ?? 0;
    if (remaining > 0) {
      completedPlanItems++;
      completedByActivity.set(activity, remaining - 1);
    }
  }
  const mockUsage = usage.entitlements.FULL_MOCK;

  return buildExamReadiness({
    now,
    goal,
    progress,
    learningDays28: Number(learning[0]?.days ?? 0),
    diagnosticCompletedAt: diagnostic[0]?.completedAt?.toISOString() ?? null,
    unresolvedMistakes: mistakes.unresolved,
    masteredMistakes: mistakes.mastered,
    weeklyPlan: { planned: planned.length, completed: completedPlanItems },
    mocks: {
      completed: Number(mocks[0]?.completed ?? 0),
      latestCompletedAt: mocks[0]?.latestCompletedAt?.toISOString() ?? null,
    },
    plan: usage.effectivePlan,
    mockQuotaReached: mockUsage.type === "LIMITED" && mockUsage.remaining === 0,
  });
}
