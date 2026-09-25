import "server-only";
import { and, count, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { passageSets, questions } from "@/db/schema";

/** Counts only questions learners can access in the published question bank. */
export async function getPublishedQuestionBankStats() {
  const rows = await db
    .select({ part: questions.toeicPart, value: count() })
    .from(questions)
    .leftJoin(passageSets, eq(questions.passageSetId, passageSets.id))
    .where(and(
      eq(questions.status, "published"),
      or(isNull(questions.passageSetId), eq(passageSets.status, "published")),
    ))
    .groupBy(questions.toeicPart);

  const byPart = Object.fromEntries(rows.map((row) => [row.part, Number(row.value)])) as Record<number, number>;
  return { byPart, total: rows.reduce((total, row) => total + Number(row.value), 0) };
}
