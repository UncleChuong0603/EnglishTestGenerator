import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { MASTERY_REQUIRED_SUCCESS_STREAK } from "./constants";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type MasteryAnswer = { questionId: string; isCorrect: boolean; answeredAt?: Date | null };

/** Must run in the same transaction that persists the answers. Ordinary correct answers are intentionally ignored. */
export async function reconcileMasteryAnswers(tx: Transaction, userId: string | null, source: string, answers: MasteryAnswer[]) {
  if (!userId) return;
  const now = new Date();
  for (const answer of answers) {
    const at = answer.answeredAt ?? now;
    if (source === "mastery_review") {
      await tx.execute(sql`
        UPDATE question_mastery SET
          review_attempt_count = review_attempt_count + 1,
          review_success_streak = CASE WHEN ${answer.isCorrect} THEN review_success_streak + 1 ELSE 0 END,
          status = CASE WHEN ${answer.isCorrect} AND review_success_streak + 1 >= ${MASTERY_REQUIRED_SUCCESS_STREAK} THEN 'MASTERED' ELSE 'UNRESOLVED' END,
          mastered_at = CASE WHEN ${answer.isCorrect} AND review_success_streak + 1 >= ${MASTERY_REQUIRED_SUCCESS_STREAK} THEN coalesce(mastered_at, ${at}) ELSE NULL END,
          last_reviewed_at = ${at},
          last_missed_at = CASE WHEN ${answer.isCorrect} THEN last_missed_at ELSE ${at} END,
          updated_at = ${at}
        WHERE user_id = ${userId} AND question_id = ${answer.questionId}
      `);
    } else if (!answer.isCorrect) {
      await tx.execute(sql`
        INSERT INTO question_mastery (user_id, question_id, status, first_missed_at, last_missed_at, review_success_streak, mastered_at, updated_at)
        VALUES (${userId}, ${answer.questionId}, 'UNRESOLVED', ${at}, ${at}, 0, NULL, ${at})
        ON CONFLICT (user_id, question_id) DO UPDATE SET
          status = 'UNRESOLVED', last_missed_at = excluded.last_missed_at,
          review_success_streak = 0, mastered_at = NULL, updated_at = excluded.updated_at
      `);
    }
  }
}

