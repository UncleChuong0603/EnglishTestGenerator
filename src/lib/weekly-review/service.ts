import "server-only";
import { and, eq, gte, lt, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, fullMockRuns, practiceSessions, questionMastery, questions, weeklyPlanSnapshots } from "@/db/schema";
import { getMistakeOverview, type MistakeOverview } from "@/lib/mastery/queries";
import { activityForSession, productWeekWindow, type PlanActivity } from "@/lib/weekly-plan/policy";
import { buildWeeklyReview, type ReviewFacts } from "./policy";

const WEEK_MS = 7 * 86_400_000;
const knownActivities = new Set<PlanActivity>(["WORKOUT", "FOCUSED_READING", "REVIEW", "READING", "LISTENING", "MOCK_LISTENING"]);

async function getWeekFacts(userId: string, start: Date, end: Date, mistakes: MistakeOverview): Promise<ReviewFacts> {
  const completedPractice = and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "submitted"),
    gte(practiceSessions.submittedAt, start), lt(practiceSessions.submittedAt, end),
    notInArray(practiceSessions.source, ["diagnostic", "full_mock", "ranked_challenge"]), sql`${practiceSessions.practiceType} <> 'demo_test'`);
  const eligibleAnswers = and(eq(attemptAnswers.userId, userId), eq(practiceSessions.status, "submitted"),
    gte(attemptAnswers.answeredAt, start), lt(attemptAnswers.answeredAt, end),
    notInArray(practiceSessions.source, ["diagnostic", "ranked_challenge"]), sql`${practiceSessions.practiceType} <> 'demo_test'`,
    sql`(${practiceSessions.source} <> 'full_mock' or ${fullMockRuns.status} = 'COMPLETED')`);
  const weekStart = new Date(start.getTime() + 7 * 3_600_000).toISOString().slice(0, 10);
  const [sessions, answers, breakdown, mocks, mastered, snapshot] = await Promise.all([
    db.select({ source: practiceSessions.source, skillArea: practiceSessions.skillArea, part: practiceSessions.part, count: sql<number>`count(*)::int` })
      .from(practiceSessions).where(completedPractice).groupBy(practiceSessions.source, practiceSessions.skillArea, practiceSessions.part),
    db.select({ answered: sql<number>`count(*)::int`, correct: sql<number>`count(*) filter (where ${attemptAnswers.isCorrect})::int`,
      days: sql<number>`count(distinct to_char(timezone('Asia/Ho_Chi_Minh', ${attemptAnswers.answeredAt}), 'YYYY-MM-DD'))::int` })
      .from(attemptAnswers).innerJoin(practiceSessions, and(eq(practiceSessions.id, attemptAnswers.sessionId), eq(practiceSessions.userId, attemptAnswers.userId)))
      .leftJoin(fullMockRuns, eq(fullMockRuns.id, practiceSessions.fullMockRunId)).where(eligibleAnswers),
    db.select({ part: questions.toeicPart, skill: questions.skill, subskill: questions.subSkill,
      answered: sql<number>`count(*)::int`, correct: sql<number>`count(*) filter (where ${attemptAnswers.isCorrect})::int` })
      .from(attemptAnswers).innerJoin(practiceSessions, and(eq(practiceSessions.id, attemptAnswers.sessionId), eq(practiceSessions.userId, attemptAnswers.userId)))
      .leftJoin(fullMockRuns, eq(fullMockRuns.id, practiceSessions.fullMockRunId))
      .innerJoin(questions, eq(questions.id, attemptAnswers.questionId)).where(eligibleAnswers)
      .groupBy(questions.toeicPart, questions.skill, questions.subSkill),
    db.select({ count: sql<number>`count(*)::int` }).from(fullMockRuns).where(and(eq(fullMockRuns.userId, userId),
      eq(fullMockRuns.status, "COMPLETED"), eq(fullMockRuns.mode, "LISTENING"), gte(fullMockRuns.completedAt, start), lt(fullMockRuns.completedAt, end))),
    db.select({ count: sql<number>`count(*)::int` }).from(questionMastery).where(and(eq(questionMastery.userId, userId),
      eq(questionMastery.status, "MASTERED"), gte(questionMastery.masteredAt, start), lt(questionMastery.masteredAt, end))),
    db.select({ items: weeklyPlanSnapshots.items, signature: weeklyPlanSnapshots.signature }).from(weeklyPlanSnapshots)
      .where(and(eq(weeklyPlanSnapshots.userId, userId), eq(weeklyPlanSnapshots.weekStart, weekStart))).limit(1),
  ]);
  const activities: ReviewFacts["activities"] = {};
  for (const row of sessions) {
    const activity = activityForSession(row.source, row.skillArea, row.part);
    if (activity) activities[activity] = (activities[activity] ?? 0) + Number(row.count);
  }
  activities.MOCK_LISTENING = Number(mocks[0]?.count ?? 0);
  return { weekStart, learningDays: Number(answers[0]?.days ?? 0), completedSessions: sessions.reduce((sum, row) => sum + Number(row.count), 0) + Number(mocks[0]?.count ?? 0),
    answered: Number(answers[0]?.answered ?? 0), correct: Number(answers[0]?.correct ?? 0), activities,
    breakdown: breakdown.map(row => ({ part: row.part, skill: row.skill, subskill: row.subskill, answered: Number(row.answered), correct: Number(row.correct) })),
    unresolvedMistakes: mistakes.unresolvedCount, repeatedMistakes: mistakes.repeatedMistakeCount,
    masteredMistakes: Number(mastered[0]?.count ?? 0),
    plannedActivities: snapshot[0] ? (snapshot[0].signature.startsWith('["FREE"') ? snapshot[0].items.slice(0, 3) : snapshot[0].items)
      .flatMap(item => knownActivities.has(item.activity as PlanActivity) ? [item.activity as PlanActivity] : []) : null };
}

export async function getWeeklyReview(userId: string, now = new Date(), overview?: MistakeOverview) {
  const currentWeek = productWeekWindow(now);
  const lastStart = new Date(currentWeek.start.getTime() - WEEK_MS);
  const priorStart = new Date(lastStart.getTime() - WEEK_MS);
  const mistakes = overview ?? await getMistakeOverview(userId);
  const [last, prior] = await Promise.all([
    getWeekFacts(userId, lastStart, currentWeek.start, mistakes),
    getWeekFacts(userId, priorStart, lastStart, mistakes),
  ]);
  return buildWeeklyReview(last, prior);
}
