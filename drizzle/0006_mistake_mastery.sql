CREATE TABLE "question_mastery" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "question_id" uuid NOT NULL,
  "status" text DEFAULT 'UNRESOLVED' NOT NULL,
  "first_missed_at" timestamp with time zone NOT NULL,
  "last_missed_at" timestamp with time zone NOT NULL,
  "last_reviewed_at" timestamp with time zone,
  "review_attempt_count" integer DEFAULT 0 NOT NULL,
  "review_success_streak" integer DEFAULT 0 NOT NULL,
  "mastered_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "question_mastery_user_question_unique" UNIQUE("user_id","question_id"),
  CONSTRAINT "question_mastery_status_check" CHECK ("status" in ('UNRESOLVED','MASTERED')),
  CONSTRAINT "question_mastery_counts_check" CHECK ("review_attempt_count" >= 0 and "review_success_streak" >= 0)
);--> statement-breakpoint
ALTER TABLE "question_mastery" ADD CONSTRAINT "question_mastery_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "question_mastery" ADD CONSTRAINT "question_mastery_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict;--> statement-breakpoint
CREATE INDEX "question_mastery_user_status_missed_idx" ON "question_mastery" ("user_id","status","last_missed_at");--> statement-breakpoint
CREATE INDEX "question_mastery_question_idx" ON "question_mastery" ("question_id");--> statement-breakpoint
ALTER TABLE "practice_sessions" DROP CONSTRAINT IF EXISTS "practice_sessions_source_check";--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_source_check" CHECK ("source" in ('recommended','custom','demo_test','guest','diagnostic','mastery_review'));--> statement-breakpoint
INSERT INTO "question_mastery" ("user_id", "question_id", "status", "first_missed_at", "last_missed_at")
SELECT aa."user_id", aa."question_id", 'UNRESOLVED', min(coalesce(aa."answered_at", aa."created_at")), max(coalesce(aa."answered_at", aa."created_at"))
FROM "attempt_answers" aa
JOIN "practice_sessions" ps ON ps."id" = aa."session_id"
LEFT JOIN "diagnostic_runs" dr ON dr."id" = ps."diagnostic_run_id"
WHERE aa."user_id" IS NOT NULL AND aa."is_correct" = false AND ps."status" = 'submitted'
  AND (ps."source" <> 'diagnostic' OR dr."status" = 'COMPLETED')
GROUP BY aa."user_id", aa."question_id"
ON CONFLICT ("user_id", "question_id") DO NOTHING;
