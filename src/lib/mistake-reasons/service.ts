import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, mistakeReasonClassifications, practiceSessions, questions } from "@/db/schema";
import { analyzeMistakeReasonPattern } from "./analytics";
import {
  applicableMistakeReasons,
  isReasonApplicable,
  mistakeReasonCodeSchema,
  suggestMistakeReasons,
  type MistakeReasonCode,
} from "./catalog";

export class MistakeReasonError extends Error {
  constructor(readonly code: "INVALID_REASON" | "NOT_FOUND" | "NOT_WRONG") {
    super(code);
  }
}

export async function saveUserMistakeReason(input: { userId: string; sessionId: string; questionId: string; reasonCode: unknown }) {
  const parsed = mistakeReasonCodeSchema.safeParse(input.reasonCode);
  if (!parsed.success || parsed.data === "UNKNOWN") throw new MistakeReasonError("INVALID_REASON");
  const [attempt] = await db.select({ isCorrect: attemptAnswers.isCorrect, part: questions.toeicPart })
    .from(attemptAnswers)
    .innerJoin(practiceSessions, eq(practiceSessions.id, attemptAnswers.sessionId))
    .innerJoin(questions, eq(questions.id, attemptAnswers.questionId))
    .where(and(
      eq(attemptAnswers.sessionId, input.sessionId),
      eq(attemptAnswers.questionId, input.questionId),
      eq(attemptAnswers.userId, input.userId),
      eq(practiceSessions.userId, input.userId),
      eq(practiceSessions.status, "submitted"),
    )).limit(1);
  if (!attempt) throw new MistakeReasonError("NOT_FOUND");
  if (attempt.isCorrect) throw new MistakeReasonError("NOT_WRONG");
  if (!isReasonApplicable(parsed.data, attempt.part)) throw new MistakeReasonError("INVALID_REASON");
  const now = new Date();
  const [saved] = await db.insert(mistakeReasonClassifications).values({
    userId: input.userId,
    sessionId: input.sessionId,
    questionId: input.questionId,
    reasonCode: parsed.data,
    evidenceSource: "USER_SELECTED",
  }).onConflictDoUpdate({
    target: [mistakeReasonClassifications.userId, mistakeReasonClassifications.sessionId, mistakeReasonClassifications.questionId],
    set: { reasonCode: parsed.data, evidenceSource: "USER_SELECTED", updatedAt: now },
  }).returning();
  return { ...saved, reasonCode: saved.reasonCode as MistakeReasonCode, evidenceSource: "USER_SELECTED" as const };
}

export async function getSessionMistakeReasons(userId: string, sessionId: string) {
  const rows = await db.select().from(mistakeReasonClassifications).where(and(
    eq(mistakeReasonClassifications.userId, userId),
    eq(mistakeReasonClassifications.sessionId, sessionId),
  ));
  return new Map(rows.map((row) => [row.questionId, { code: row.reasonCode as MistakeReasonCode, evidenceSource: row.evidenceSource }]));
}

export async function getLatestReasonsForQuestions(userId: string, questionIds: string[]) {
  if (!questionIds.length) return new Map<string, MistakeReasonCode>();
  const rows = await db.select({ questionId: mistakeReasonClassifications.questionId, reasonCode: mistakeReasonClassifications.reasonCode })
    .from(mistakeReasonClassifications)
    .where(and(eq(mistakeReasonClassifications.userId, userId), inArray(mistakeReasonClassifications.questionId, questionIds)))
    .orderBy(desc(mistakeReasonClassifications.updatedAt));
  const result = new Map<string, MistakeReasonCode>();
  for (const row of rows) if (!result.has(row.questionId)) result.set(row.questionId, row.reasonCode as MistakeReasonCode);
  return result;
}

export async function getMistakeReasonPattern(userId: string) {
  const rows = await db.select({ reasonCode: mistakeReasonClassifications.reasonCode })
    .from(mistakeReasonClassifications)
    .where(eq(mistakeReasonClassifications.userId, userId));
  return analyzeMistakeReasonPattern(rows.map((row) => row.reasonCode as MistakeReasonCode));
}

export function mistakeReasonChoices(input: { part: number; skill: string; subSkill: string }) {
  const suggested = new Set(suggestMistakeReasons(input));
  return applicableMistakeReasons(input.part).map((reason) => ({
    code: reason.code,
    label: reason.label,
    suggested: suggested.has(reason.code),
    evidenceSource: suggested.has(reason.code) ? "SYSTEM_SUGGESTED" as const : null,
  }));
}
