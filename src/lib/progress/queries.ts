import "server-only";
import { and, count, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, fullMockRuns, practiceSessions, questions } from "@/db/schema";
import { isValidSkillPart, type PartBearingSkillArea, type ToeicPart } from "@/lib/toeic/domain";
import { calculateToeicProgress } from "./calculate";
import type { ProgressAggregateRow, ToeicProgress } from "./types";
import { buildDailyTrend, comparePeriods, productDayStart, type DailyAnswerCount, type TrendPeriod } from "./trends";

/** One grouped SQL query; answer rows are never materialized in application memory. */
export async function getToeicProgress(userId: string): Promise<ToeicProgress> {
  const rows = await db.select({
    skillArea: questions.skillArea,
    part: questions.toeicPart,
    skill: questions.skill,
    subskill: questions.subSkill,
    attemptedCount: count(attemptAnswers.id),
    correctCount: sql<number>`count(*) filter (where ${attemptAnswers.isCorrect})::int`,
    latestAttemptAt: max(sql<Date>`coalesce(${attemptAnswers.answeredAt}, ${attemptAnswers.createdAt})`),
  }).from(attemptAnswers)
    .innerJoin(practiceSessions, and(eq(practiceSessions.id, attemptAnswers.sessionId), eq(practiceSessions.userId, attemptAnswers.userId)))
    .leftJoin(fullMockRuns, eq(fullMockRuns.id, practiceSessions.fullMockRunId))
    .innerJoin(questions, eq(questions.id, attemptAnswers.questionId))
    .where(and(eq(attemptAnswers.userId, userId), eq(practiceSessions.status, "submitted"), sql`${questions.skillArea} = ${practiceSessions.skillArea}`, sql`(${practiceSessions.source} <> 'full_mock' or ${fullMockRuns.status} = 'COMPLETED')`))
    .groupBy(questions.skillArea, questions.toeicPart, questions.skill, questions.subSkill);

  const safeRows: ProgressAggregateRow[] = rows.flatMap((row) => {
    if ((row.skillArea !== "LISTENING" && row.skillArea !== "READING") || !isValidSkillPart(row.skillArea, row.part)) return [];
    return [{ skillArea: row.skillArea as PartBearingSkillArea, part: row.part as ToeicPart, skill: row.skill.trim() || "other", subskill: row.subskill.trim() || "other", attemptedCount: Number(row.attemptedCount), correctCount: Number(row.correctCount), latestAttemptAt: row.latestAttemptAt ? new Date(row.latestAttemptAt).toISOString() : null }];
  });
  return calculateToeicProgress(safeRows);
}

/** One bounded grouped query. Empty calendar days are filled server-side with accuracy=null. */
export async function getLearnerTrend(userId: string, period: TrendPeriod, now = new Date()) {
  const start = new Date(productDayStart(now).getTime() - (period * 2 - 1) * 86_400_000);
  const rows = await db.select({
    day: sql<string>`to_char(timezone('Asia/Ho_Chi_Minh', coalesce(${attemptAnswers.answeredAt}, ${attemptAnswers.createdAt})), 'YYYY-MM-DD')`,
    answeredCount: count(attemptAnswers.id),
    correctCount: sql<number>`count(*) filter (where ${attemptAnswers.isCorrect})::int`,
  }).from(attemptAnswers)
    .innerJoin(practiceSessions, and(eq(practiceSessions.id, attemptAnswers.sessionId), eq(practiceSessions.userId, attemptAnswers.userId)))
    .leftJoin(fullMockRuns, eq(fullMockRuns.id, practiceSessions.fullMockRunId))
    .where(and(eq(attemptAnswers.userId, userId), eq(practiceSessions.status, "submitted"), sql`coalesce(${attemptAnswers.answeredAt}, ${attemptAnswers.createdAt}) >= ${start}`, sql`(${practiceSessions.source} <> 'full_mock' or ${fullMockRuns.status} = 'COMPLETED')`))
    .groupBy(sql`to_char(timezone('Asia/Ho_Chi_Minh', coalesce(${attemptAnswers.answeredAt}, ${attemptAnswers.createdAt})), 'YYYY-MM-DD')`);
  const normalized: DailyAnswerCount[] = rows.map((row) => ({ day: row.day, answeredCount: Number(row.answeredCount), correctCount: Number(row.correctCount) }));
  return { period, points: buildDailyTrend(normalized, period, now), comparison: comparePeriods(normalized, period, now) };
}
