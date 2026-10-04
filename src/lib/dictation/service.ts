import "server-only";

import { createHash } from "node:crypto";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import {
  attemptAnswers,
  dictationAttempts,
  dictationSessions,
  questions,
} from "@/db/schema";
import { getMistakeReasonPattern } from "@/lib/mistake-reasons/service";
import {
  getListeningTalk,
  listeningTalks,
} from "@/lib/listening-lessons/talks";
import { scoreDictation } from "./scoring";

export class DictationError extends Error {
  constructor(
    readonly code: "NOT_FOUND" | "CONTENT_CHANGED" | "ANSWER_REQUIRED",
  ) {
    super(code);
  }
}

const eligibleTalks = listeningTalks.filter((talk) => talk.minutes === 1);
const fingerprint = (value: string) =>
  createHash("sha256").update(value).digest("hex");

function resolveTalk(sourceRef: string) {
  const talk = getListeningTalk(sourceRef);
  if (!talk || talk.minutes !== 1) throw new DictationError("NOT_FOUND");
  return talk;
}

function projectSession(
  row: typeof dictationSessions.$inferSelect,
  includeTranscript = false,
) {
  const talk = resolveTalk(row.sourceRef);
  if (fingerprint(talk.transcript) !== row.contentFingerprint)
    throw new DictationError("CONTENT_CHANGED");
  return {
    id: row.id,
    sourceRef: talk.slug,
    title: { vi: talk.titleVi, en: talk.titleEn },
    description: { vi: talk.descriptionVi, en: talk.descriptionEn },
    audioUrl: talk.audioUrl,
    status: row.status as "IN_PROGRESS" | "MASTERED",
    attemptsCount: row.attemptsCount,
    bestAccuracy: row.bestAccuracy,
    hintUsed: row.hintUsed,
    masteredAt: row.masteredAt?.toISOString() ?? null,
    transcript:
      includeTranscript || row.transcriptRevealedAt ? talk.transcript : null,
  };
}

export async function dictationCatalog(userId: string) {
  const [pattern, listeningDetail] = await Promise.all([
    getMistakeReasonPattern(userId),
    db
      .select({ id: attemptAnswers.id })
      .from(attemptAnswers)
      .innerJoin(questions, eq(questions.id, attemptAnswers.questionId))
      .where(
        and(
          eq(attemptAnswers.userId, userId),
          eq(attemptAnswers.isCorrect, false),
          eq(questions.skillArea, "LISTENING"),
          or(
            ilike(questions.skill, "%detail%"),
            ilike(questions.subSkill, "%detail%"),
            ilike(questions.subSkill, "%explicit%"),
          ),
        ),
      )
      .orderBy(desc(attemptAnswers.createdAt))
      .limit(1),
  ]);
  const reasonRecommended =
    pattern.top?.code === "MISHEARD_WORD" ||
    pattern.top?.code === "PARAPHRASE_MISSED";
  const recommended = reasonRecommended || listeningDetail.length > 0;
  return {
    recommendation: reasonRecommended
      ? { reasonCode: pattern.top!.code, evidence: "MISTAKE_PATTERN" as const }
      : listeningDetail.length
        ? {
            reasonCode: "LISTENING_DETAIL" as const,
            evidence: "LISTENING_DETAIL" as const,
          }
        : null,
    items: eligibleTalks.map((talk) => ({
      sourceRef: talk.slug,
      title: { vi: talk.titleVi, en: talk.titleEn },
      description: { vi: talk.descriptionVi, en: talk.descriptionEn },
      minutes: talk.minutes,
      recommended,
    })),
  };
}

export async function startDictation(userId: string, sourceRef: string) {
  const talk = resolveTalk(sourceRef);
  const [row] = await db
    .insert(dictationSessions)
    .values({
      userId,
      sourceType: "TALK",
      sourceRef: talk.slug,
      contentFingerprint: fingerprint(talk.transcript),
    })
    .returning();
  return projectSession(row!);
}

export async function getDictation(userId: string, sessionId: string) {
  const [row] = await db
    .select()
    .from(dictationSessions)
    .where(
      and(
        eq(dictationSessions.id, sessionId),
        eq(dictationSessions.userId, userId),
      ),
    )
    .limit(1);
  if (!row) throw new DictationError("NOT_FOUND");
  return projectSession(row);
}

export async function revealDictationHint(userId: string, sessionId: string) {
  const [row] = await db
    .update(dictationSessions)
    .set({ hintUsed: true, updatedAt: new Date() })
    .where(
      and(
        eq(dictationSessions.id, sessionId),
        eq(dictationSessions.userId, userId),
      ),
    )
    .returning();
  if (!row) throw new DictationError("NOT_FOUND");
  const talk = resolveTalk(row.sourceRef);
  const words = talk.transcript.trim().split(/\s+/);
  return {
    wordCount: words.length,
    openingWord: words[0]!.replace(/[^\p{L}\p{N}']/gu, ""),
  };
}

export async function submitDictation(
  userId: string,
  sessionId: string,
  answer: string,
) {
  if (!answer.trim()) throw new DictationError("ANSWER_REQUIRED");
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(dictationSessions)
      .where(
        and(
          eq(dictationSessions.id, sessionId),
          eq(dictationSessions.userId, userId),
        ),
      )
      .for("update")
      .limit(1);
    if (!row) throw new DictationError("NOT_FOUND");
    const talk = resolveTalk(row.sourceRef);
    if (fingerprint(talk.transcript) !== row.contentFingerprint)
      throw new DictationError("CONTENT_CHANGED");
    const score = scoreDictation(answer, talk.transcript);
    const attemptNumber = row.attemptsCount + 1;
    const now = new Date();
    await tx.insert(dictationAttempts).values({
      sessionId,
      userId,
      attemptNumber,
      accuracy: score.accuracy,
      exact: score.exact,
      usedHint: row.hintUsed,
    });
    const [updated] = await tx
      .update(dictationSessions)
      .set({
        attemptsCount: attemptNumber,
        bestAccuracy: Math.max(row.bestAccuracy, score.accuracy),
        transcriptRevealedAt: row.transcriptRevealedAt ?? now,
        status: score.exact ? "MASTERED" : row.status,
        masteredAt: score.exact ? (row.masteredAt ?? now) : row.masteredAt,
        updatedAt: now,
      })
      .where(eq(dictationSessions.id, row.id))
      .returning();
    return { ...projectSession(updated!, true), result: score };
  });
}

export async function dictationHistory(userId: string, limit = 20) {
  const rows = await db
    .select()
    .from(dictationSessions)
    .where(eq(dictationSessions.userId, userId))
    .orderBy(desc(dictationSessions.updatedAt))
    .limit(Math.min(Math.max(limit, 1), 20));
  return rows.map((row) => projectSession(row));
}
