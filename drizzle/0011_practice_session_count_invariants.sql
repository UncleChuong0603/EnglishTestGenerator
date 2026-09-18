ALTER TABLE "practice_sessions" DROP CONSTRAINT IF EXISTS "practice_sessions_count_check";--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_count_check" CHECK (
  "question_count" > 0
  AND (
    "requested_question_count" IS NULL
    OR "requested_question_count" > 0
  )
);
