import "server-only";
import { and, eq, gte, lt, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, fullMockRuns, practiceSessions, weeklyPlanSnapshots } from "@/db/schema";
import type { DashboardData } from "@/lib/dashboard/service";
import type { UsageStatus } from "@/lib/entitlements/service";
import { getPlanCapabilities } from "@/lib/entitlements/catalog";
import type { GoalProfile } from "@/lib/goals/domain";
import { getMockHubReadiness } from "@/lib/full-mock/service";
import { selectListeningPractice, loadUnits } from "@/lib/practice/selector";
import { getGroupSafeWorkoutSize } from "@/lib/workout/policy";
import type { WeeklyReview } from "@/lib/weekly-review/policy";
import { activityForSession, buildWeeklyPlan, productWeekWindow, type PlanActivity, type WeeklyPlan, type WeeklyPlanItem } from "./policy";

const available = (usage: UsageStatus, key: keyof UsageStatus["entitlements"]) => {
  const item = usage.entitlements[key];
  return item.type === "UNLIMITED" || item.remaining > 0;
};

function materialSignature(goal: GoalProfile | null, plan: string) {
  return JSON.stringify([plan, goal?.targetScore ?? null, goal?.examDate ?? null, goal?.dailyStudyMinutes ?? null, goal?.studyDaysPerWeek ?? null]);
}

function applySnapshot(plan: WeeklyPlan, items: Array<{ slot: number; activity: string; minutes: number; reason: string }>, reasons: string[], completedByActivity: Partial<Record<PlanActivity, number>>, premium: boolean): WeeklyPlan {
  const availability = new Map(plan.items.map(item => [item.activity, item.available]));
  const remaining = new Map<PlanActivity, number>(Object.entries(completedByActivity) as Array<[PlanActivity, number]>);
  const stable: WeeklyPlanItem[] = items.flatMap(item => {
    if (!["WORKOUT", "FOCUSED_READING", "REVIEW", "READING", "LISTENING", "MOCK_LISTENING"].includes(item.activity)) return [];
    const activity = item.activity as PlanActivity;
    const completed = (remaining.get(activity) ?? 0) > 0;
    if (completed) remaining.set(activity, remaining.get(activity)! - 1);
    return [{ slot: item.slot, activity, minutes: item.minutes, reason: item.reason as WeeklyPlanItem["reason"], completed, available: availability.get(activity) ?? false }];
  });
  return { ...plan, items: stable, preview: premium ? stable : stable.slice(0, 3), adjustmentReasons: reasons };
}

export async function getWeeklyPlan(userId: string, goal: GoalProfile | null, usage: UsageStatus, dashboard: DashboardData, review: WeeklyReview | null = null, now = new Date()) {
  const week = productWeekWindow(now);
  const minutes = goal?.dailyStudyMinutes ?? 20;
  const focusPart = dashboard.recommendation?.part;
  const recommendation = dashboard.recommendation;
  const targetQuestions = minutes >= 45 ? 20 : minutes >= 30 ? 15 : 10;
  const recommendedReadyQuery = !recommendation ? Promise.resolve(false)
    : recommendation.skillArea === "READING"
      ? loadUnits((recommendation.part && recommendation.part >= 5 ? recommendation.part : 5) as 5 | 6 | 7).then(units => units.length > 0).catch(() => false)
      : recommendation.part && recommendation.part <= 4
        ? selectListeningPractice(recommendation.part as 1 | 2 | 3 | 4,
          recommendation.part >= 3 ? getGroupSafeWorkoutSize(recommendation.part, targetQuestions).groupCount! : targetQuestions,
          { userId, skill: recommendation.primarySkill ?? undefined, subSkill: recommendation.primarySubskill ?? undefined }).then(() => true).catch(() => false)
        : Promise.resolve(false);
  const [recommendedReady, readingReady, focusedReadingReady, listeningReady, mockListeningReady, activity, learning, mockActivity, history, existing] = await Promise.all([
    recommendedReadyQuery,
    loadUnits(5).then(units => units.length >= (minutes >= 45 ? 20 : minutes >= 30 ? 15 : 10)).catch(() => false),
    usage.effectivePlan === "PREMIUM" && dashboard.recommendation?.reasonCode === "SUPPORTED_WEAKNESS" && dashboard.recommendation.skillArea === "READING" && focusPart !== null && focusPart !== undefined && focusPart >= 5
      ? loadUnits(focusPart as 5 | 6 | 7).then(units => units.length > 0).catch(() => false) : Promise.resolve(false),
    minutes >= 20 ? selectListeningPractice(2, 10, { userId }).then(() => true).catch(() => false) : Promise.resolve(false),
    usage.effectivePlan === "PREMIUM" && minutes >= 45 ? getMockHubReadiness().then(readiness => readiness.listening.ready).catch(() => false) : Promise.resolve(false),
    db.select({ source: practiceSessions.source, skillArea: practiceSessions.skillArea, part: practiceSessions.part, completedActivities: sql<number>`count(*)::int` }).from(practiceSessions)
      .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "submitted"), gte(practiceSessions.submittedAt, week.start), lt(practiceSessions.submittedAt, week.end), notInArray(practiceSessions.source, ["diagnostic", "full_mock", "ranked_challenge"]), sql`${practiceSessions.practiceType} <> 'demo_test'`))
      .groupBy(practiceSessions.source, practiceSessions.skillArea, practiceSessions.part),
    db.select({ learningDays: sql<number>`count(distinct to_char(timezone('Asia/Ho_Chi_Minh', ${attemptAnswers.answeredAt}), 'YYYY-MM-DD'))::int` }).from(attemptAnswers)
      .innerJoin(practiceSessions, eq(practiceSessions.id, attemptAnswers.sessionId))
      .where(and(eq(attemptAnswers.userId, userId), gte(attemptAnswers.answeredAt, week.start), lt(attemptAnswers.answeredAt, week.end), notInArray(practiceSessions.source, ["diagnostic", "ranked_challenge"]), sql`${practiceSessions.practiceType} <> 'demo_test'`)),
    db.select({ completedActivities: sql<number>`count(*)::int` }).from(fullMockRuns)
      .where(and(eq(fullMockRuns.userId, userId), eq(fullMockRuns.status, "COMPLETED"), eq(fullMockRuns.mode, "LISTENING"), gte(fullMockRuns.completedAt, week.start), lt(fullMockRuns.completedAt, week.end))),
    usage.effectivePlan === "PREMIUM" ? db.select({
      weekStart: sql<string>`to_char(date_trunc('week', timezone('Asia/Ho_Chi_Minh', ${practiceSessions.submittedAt})), 'YYYY-MM-DD')`,
      completedSessions: sql<number>`count(*)::int`,
    }).from(practiceSessions)
      .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "submitted"), gte(practiceSessions.submittedAt, new Date(week.start.getTime() - getPlanCapabilities(usage.effectivePlan).historyWindowDays * 86_400_000)), lt(practiceSessions.submittedAt, week.start), notInArray(practiceSessions.source, ["diagnostic", "full_mock", "ranked_challenge"]), sql`${practiceSessions.practiceType} <> 'demo_test'`))
      .groupBy(sql`date_trunc('week', timezone('Asia/Ho_Chi_Minh', ${practiceSessions.submittedAt}))`)
      .orderBy(sql`date_trunc('week', timezone('Asia/Ho_Chi_Minh', ${practiceSessions.submittedAt})) desc`)
      .limit(4) : Promise.resolve([]),
    db.select({ signature: weeklyPlanSnapshots.signature, items: weeklyPlanSnapshots.items, adjustmentReasons: weeklyPlanSnapshots.adjustmentReasons })
      .from(weeklyPlanSnapshots).where(and(eq(weeklyPlanSnapshots.userId, userId), eq(weeklyPlanSnapshots.weekStart, new Date(week.start.getTime() + 7 * 3_600_000).toISOString().slice(0, 10)))).limit(1),
  ]);
  const completedByActivity: Partial<Record<PlanActivity, number>> = {};
  for (const row of activity) {
    const key = activityForSession(row.source, row.skillArea, row.part);
    if (key) completedByActivity[key] = (completedByActivity[key] ?? 0) + Number(row.completedActivities);
  }
  completedByActivity.MOCK_LISTENING = Number(mockActivity[0]?.completedActivities ?? 0);
  const plan = buildWeeklyPlan({ now, goal, plan: usage.effectivePlan, recommendation, recommendedReady,
    reviewableMistakes: dashboard.mistakes.reviewableCount, repeatedMistakes: dashboard.mistakes.repeatedMistakeCount,
    readingReady, focusedReadingReady, listeningReady, mockListeningReady,
    workoutAvailable: available(usage, "TODAYS_WORKOUT"), reviewAvailable: available(usage, "MASTERY_REVIEW"),
    manualAvailable: available(usage, "MANUAL_PRACTICE"), mockAvailable: available(usage, "FULL_MOCK"),
    learningDays: Number(learning[0]?.learningDays ?? 0), completedActivities: activity.reduce((sum, row) => sum + Number(row.completedActivities), 0) + Number(mockActivity[0]?.completedActivities ?? 0), completedByActivity,
    history: history.map(row => ({ weekStart: row.weekStart, completedSessions: Number(row.completedSessions) })), review,
  });
  const signature = materialSignature(goal, usage.effectivePlan);
  if (existing[0]?.signature === signature) return applySnapshot(plan, existing[0].items, existing[0].adjustmentReasons, completedByActivity, usage.effectivePlan === "PREMIUM");
  if (!plan.items.length) return plan;
  const saved = await db.insert(weeklyPlanSnapshots).values({ userId, weekStart: plan.weekStart, signature,
    items: plan.items.map(({ slot, activity, minutes, reason }) => ({ slot, activity, minutes, reason })), adjustmentReasons: plan.adjustmentReasons })
    .onConflictDoUpdate({ target: [weeklyPlanSnapshots.userId, weeklyPlanSnapshots.weekStart],
      set: { signature, items: plan.items.map(({ slot, activity, minutes, reason }) => ({ slot, activity, minutes, reason })), adjustmentReasons: plan.adjustmentReasons, updatedAt: new Date() },
      setWhere: sql`${weeklyPlanSnapshots.signature} <> ${signature}` }).returning({ items: weeklyPlanSnapshots.items, adjustmentReasons: weeklyPlanSnapshots.adjustmentReasons });
  if (saved[0]) return applySnapshot(plan, saved[0].items, saved[0].adjustmentReasons, completedByActivity, usage.effectivePlan === "PREMIUM");
  const [concurrent] = await db.select({ items: weeklyPlanSnapshots.items, adjustmentReasons: weeklyPlanSnapshots.adjustmentReasons })
    .from(weeklyPlanSnapshots).where(and(eq(weeklyPlanSnapshots.userId, userId), eq(weeklyPlanSnapshots.weekStart, plan.weekStart))).limit(1);
  return concurrent ? applySnapshot(plan, concurrent.items, concurrent.adjustmentReasons, completedByActivity, usage.effectivePlan === "PREMIUM") : plan;
}
