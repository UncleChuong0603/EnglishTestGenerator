CREATE INDEX IF NOT EXISTS "questions_published_part_id_idx" ON "questions" USING btree ("toeic_part", "id") WHERE "status" = 'published';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "passage_sets_status_updated_id_idx" ON "passage_sets" USING btree ("status", "updated_at" DESC, "id" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attempt_answers_user_question_session_idx" ON "attempt_answers" USING btree ("user_id", "question_id", "session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "practice_sessions_submitted_recent_idx" ON "practice_sessions" USING btree ("user_id", "submitted_at" DESC) WHERE "status" = 'submitted';
--> statement-breakpoint
-- pg_trgm is packaged with the VPS PostgreSQL image, but is unavailable in PGlite.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_trgm') THEN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE INDEX IF NOT EXISTS "questions_question_text_trgm_idx" ON "questions" USING gin ("question_text" gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "passage_sets_title_trgm_idx" ON "passage_sets" USING gin ("title" gin_trgm_ops);
  END IF;
END $$;
