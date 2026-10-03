import "server-only";

import { and, eq, notInArray, sql } from "drizzle-orm";
import { practiceSessions } from "@/db/schema";
import type { CreatePracticeRequest } from "./contracts";
import { ApiV1Error } from "./errors";
import { UsageLimitError } from "@/lib/entitlements/service";
import type { PracticeTransaction } from "@/lib/practice/selector";
import { readingConfig, startPractice } from "@/lib/practice/service";

export function mapPracticeError(error: unknown): never {
  if (error instanceof ApiV1Error) throw error;
  if (error instanceof UsageLimitError) {
    throw new ApiV1Error(403, "USAGE_LIMIT_REACHED", "Your plan limit has been reached.", error.status);
  }
  const code = error instanceof Error ? error.message : "";
  if (["NOT_FOUND", "QUESTION_NOT_ASSIGNED", "OPTION_NOT_ASSIGNED"].includes(code)) throw new ApiV1Error(404, "NOT_FOUND", "Practice resource not found.");
  if (code === "SESSION_CLOSED") throw new ApiV1Error(409, "CONFLICT", "This practice session is already closed.");
  if (["NO_MISTAKES", "NO_REVIEWABLE_MISTAKES", "NO_PUBLISHED_CONTENT", "NOT_ENOUGH_HISTORY"].includes(code)) throw new ApiV1Error(409, "CONFLICT", "No suitable practice is available yet.");
  if (code === "PREMIUM_REQUIRED") throw new ApiV1Error(403, "FORBIDDEN", "This activity requires Premium.");
  throw error;
}

export async function createPractice(userId: string, request: CreatePracticeRequest, transaction: PracticeTransaction) {
  await transaction.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:practice`}, 0))`);
  const [before] = await transaction.select({ id: practiceSessions.id }).from(practiceSessions).where(and(
    eq(practiceSessions.userId, userId),
    eq(practiceSessions.status, "in_progress"),
    notInArray(practiceSessions.source, ["diagnostic", "full_mock", "ranked_challenge"]),
  )).limit(1);
  let id: string;
  if (request.kind === "TODAYS_WORKOUT") id = await startPractice(userId, { kind: "TODAYS_WORKOUT" }, transaction);
  else if (request.kind === "MASTERY_REVIEW") id = await startPractice(userId, { kind: "MASTERY_REVIEW", part: request.part, size: request.size, smart: request.smart }, transaction);
  else if (request.skillArea === "READING") {
    id = await startPractice(userId, { kind: "CUSTOM_READING", config: readingConfig((request.part ?? null) as 5 | 6 | 7 | null, request.questionCount as 10 | 15 | 20, request.skill, request.subSkill) }, transaction);
  } else {
    const part = request.part as 1 | 2 | 3 | 4;
    id = await startPractice(userId, { kind: "CUSTOM_LISTENING", part, questionCount: part >= 3 ? request.questionCount / 3 : request.questionCount }, transaction);
  }
  return { data: { id, resumed: before?.id === id } };
}
