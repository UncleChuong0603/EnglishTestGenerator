import "server-only";
import { and, count, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, practiceSessions, questions } from "@/db/schema";
import { isValidSkillPart, type PartBearingSkillArea, type ToeicPart } from "@/lib/toeic/domain";
import { calculateToeicProgress } from "./calculate";
import type { ProgressAggregateRow, ToeicProgress } from "./types";

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
    .innerJoin(questions, eq(questions.id, attemptAnswers.questionId))
    .where(and(eq(attemptAnswers.userId, userId), eq(practiceSessions.status, "submitted"), sql`${questions.skillArea} = ${practiceSessions.skillArea}`))
    .groupBy(questions.skillArea, questions.toeicPart, questions.skill, questions.subSkill);

  const safeRows: ProgressAggregateRow[] = rows.flatMap((row) => {
    if ((row.skillArea !== "LISTENING" && row.skillArea !== "READING") || !isValidSkillPart(row.skillArea, row.part)) return [];
    return [{ skillArea: row.skillArea as PartBearingSkillArea, part: row.part as ToeicPart, skill: row.skill.trim() || "other", subskill: row.subskill.trim() || "other", attemptedCount: Number(row.attemptedCount), correctCount: Number(row.correctCount), latestAttemptAt: row.latestAttemptAt ? new Date(row.latestAttemptAt).toISOString() : null }];
  });
  return calculateToeicProgress(safeRows);
}
