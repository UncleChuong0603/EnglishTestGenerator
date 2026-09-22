import "server-only";
import { sql } from "drizzle-orm";

type MeaningfulLearningAlias = "practice_sessions" | "ps";

/** Shared SQL truth for Task 26 daily learning and Task 27 retention. */
export function meaningfulLearningSessionSql(alias: MeaningfulLearningAlias) {
  const table = alias === "ps" ? "ps" : "practice_sessions";
  return sql.raw(`
    ${table}.status = 'submitted'
    and ${table}.user_id is not null
    and ${table}.submitted_at is not null
    and ${table}.source not in ('diagnostic','full_mock','ranked_challenge')
    and ${table}.practice_type <> 'demo_test'
    and exists (
      select 1
      from attempt_answers meaningful_answer
      where meaningful_answer.session_id = ${table}.id
        and meaningful_answer.user_id = ${table}.user_id
        and meaningful_answer.answered_at is not null
    )
  `);
}
