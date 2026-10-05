import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { practiceSessionQuestions, practiceSessions } from "@/db/schema";
import { consumeUsage } from "@/lib/entitlements/service";
import { flattenUniqueQuestionIds } from "@/lib/practice/selection";
import { loadContentHistory, loadUnits, type PracticeTransaction } from "@/lib/practice/selector";
import {
  SHORT_MOCK_DIFFICULTIES,
  SHORT_MOCK_PART,
  SHORT_MOCK_QUESTION_COUNT,
  shortMockDifficultyFromSource,
  shortMockSource,
  type ShortMockDifficulty,
} from "./config";
import { hasShortMockCapacity, selectShortMockQuestionIds } from "./selection";

function inTransaction<T>(
  transaction: PracticeTransaction | undefined,
  execute: (tx: PracticeTransaction) => Promise<T>,
) {
  return transaction ? execute(transaction) : db.transaction(execute);
}

async function shortMockCandidates(userId: string, difficulty: ShortMockDifficulty) {
  const units = await loadUnits(SHORT_MOCK_PART, undefined, undefined, "PRACTICE", difficulty);
  const history = await loadContentHistory(userId, flattenUniqueQuestionIds(units));
  return selectShortMockQuestionIds(units, history);
}

export async function getShortMockReadiness() {
  const entries = await Promise.all(
    SHORT_MOCK_DIFFICULTIES.map(async (difficulty) => {
      const units = await loadUnits(SHORT_MOCK_PART, undefined, undefined, "PRACTICE", difficulty);
      return [difficulty, hasShortMockCapacity(units)] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<ShortMockDifficulty, boolean>;
}

export async function getActiveShortMock(userId: string) {
  const [session] = await db
    .select({ id: practiceSessions.id, source: practiceSessions.source })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.status, "in_progress"),
        inArray(practiceSessions.source, SHORT_MOCK_DIFFICULTIES.map(shortMockSource)),
      ),
    )
    .limit(1);
  const difficulty = session ? shortMockDifficultyFromSource(session.source) : null;
  return session && difficulty ? { id: session.id, difficulty } : null;
}

export async function createShortMockSession(
  userId: string,
  difficulty: ShortMockDifficulty,
  transaction?: PracticeTransaction,
) {
  const selected = await shortMockCandidates(userId, difficulty);
  const questionIds = selected;
  if (questionIds.length < SHORT_MOCK_QUESTION_COUNT) throw new Error("SHORT_MOCK_CONTENT_NOT_READY");

  const sessionId = randomUUID();
  const source = shortMockSource(difficulty);
  const now = new Date();
  return inTransaction(transaction, async (tx) => {
    // Keep short mocks inside the same one-open-practice boundary as manual practice.
    // The lock also prevents two rapid submissions from consuming two allowances.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:practice`}, 0))`);
    const [existing] = await tx
      .select({ id: practiceSessions.id, source: practiceSessions.source })
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.userId, userId),
          eq(practiceSessions.status, "in_progress"),
          inArray(practiceSessions.source, SHORT_MOCK_DIFFICULTIES.map(shortMockSource)),
        ),
      )
      .limit(1);
    if (existing?.source === source) return existing.id;

    await tx
      .update(practiceSessions)
      .set({ status: "abandoned" })
      .where(
        and(
          eq(practiceSessions.userId, userId),
          eq(practiceSessions.status, "in_progress"),
          ne(practiceSessions.practiceType, "demo_test"),
          ne(practiceSessions.source, "diagnostic"),
          ne(practiceSessions.source, "full_mock"),
          ne(practiceSessions.source, "ranked_challenge"),
        ),
      );
    await consumeUsage(tx, {
      userId,
      entitlement: "MANUAL_PRACTICE",
      sourceType: "PRACTICE_SESSION",
      sourceId: sessionId,
      now,
    });
    const [session] = await tx
      .insert(practiceSessions)
      .values({
        id: sessionId,
        userId,
        skillArea: "READING",
        practiceType: "part_5",
        part: SHORT_MOCK_PART,
        questionCount: SHORT_MOCK_QUESTION_COUNT,
        requestedQuestionCount: SHORT_MOCK_QUESTION_COUNT,
        source,
      })
      .returning({ id: practiceSessions.id });
    await tx.insert(practiceSessionQuestions).values(
      questionIds.slice(0, SHORT_MOCK_QUESTION_COUNT).map((questionId, index) => ({
        sessionId: session.id,
        questionId,
        displayOrder: index + 1,
        passageSetId: null,
      })),
    );
    return session.id;
  });
}
