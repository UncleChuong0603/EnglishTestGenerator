import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { mediaAssets, practiceSessionQuestions, practiceSessions, questionGroupMedia, questions } from "@/db/schema";
import type { MediaStorage } from "@/lib/media/types";

/** Signs only a READY public-content asset attached to the requested question in an owned live/submitted session. */
export async function createAuthorizedListeningMediaUrl(input: { userId: string; sessionId: string; questionId?: string; groupId?: string; assetId: string }, storage: MediaStorage) {
  if (!input.questionId && !input.groupId) throw new Error("LISTENING_MEDIA_NOT_AUTHORIZED");
  const rows = await db.select({ storageKey: mediaAssets.storageKey }).from(practiceSessions)
    .innerJoin(practiceSessionQuestions, eq(practiceSessionQuestions.sessionId, practiceSessions.id))
    .innerJoin(questions, eq(questions.id, practiceSessionQuestions.questionId))
    .innerJoin(questionGroupMedia, eq(questionGroupMedia.questionGroupId, questions.passageSetId))
    .innerJoin(mediaAssets, eq(mediaAssets.id, questionGroupMedia.mediaAssetId))
    .where(and(eq(practiceSessions.id, input.sessionId), eq(practiceSessions.userId, input.userId), input.groupId ? eq(practiceSessionQuestions.passageSetId, input.groupId) : eq(practiceSessionQuestions.questionId, input.questionId!), eq(questionGroupMedia.mediaAssetId, input.assetId), eq(practiceSessions.skillArea, "LISTENING"), eq(mediaAssets.status, "READY"), eq(mediaAssets.accessScope, "CONTENT"))).limit(1);
  if (!rows[0]) throw new Error("LISTENING_MEDIA_NOT_AUTHORIZED");
  return storage.createReadUrl(rows[0].storageKey);
}
