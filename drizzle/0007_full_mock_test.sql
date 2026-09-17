CREATE TABLE "full_mock_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" text DEFAULT 'LISTENING' NOT NULL,
  "listening_started_at" timestamptz DEFAULT now() NOT NULL,
  "listening_deadline" timestamptz NOT NULL,
  "listening_completed_at" timestamptz,
  "reading_started_at" timestamptz,
  "reading_deadline" timestamptz,
  "reading_completed_at" timestamptz,
  "completed_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "full_mock_runs_status_check" CHECK ("status" IN ('LISTENING','READING','COMPLETED','EXPIRED'))
);
CREATE INDEX "full_mock_runs_user_created_idx" ON "full_mock_runs" ("user_id", "created_at");
CREATE UNIQUE INDEX "full_mock_runs_one_active_user_idx" ON "full_mock_runs" ("user_id") WHERE "status" IN ('LISTENING','READING');

ALTER TABLE "practice_sessions" ADD COLUMN "full_mock_run_id" uuid REFERENCES "full_mock_runs"("id") ON DELETE CASCADE;
ALTER TABLE "practice_sessions" ADD COLUMN "full_mock_order" smallint;
DROP INDEX "practice_sessions_one_open_practice_idx";
CREATE UNIQUE INDEX "practice_sessions_one_open_practice_idx" ON "practice_sessions" ("user_id") WHERE "status" = 'in_progress' AND "practice_type" <> 'demo_test' AND "source" NOT IN ('diagnostic','full_mock') AND "user_id" IS NOT NULL;
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_full_mock_order_unique" UNIQUE ("full_mock_run_id", "full_mock_order");
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_full_mock_link_check" CHECK (("source" = 'full_mock' AND "full_mock_run_id" IS NOT NULL AND "full_mock_order" BETWEEN 1 AND 7 AND "user_id" IS NOT NULL AND "guest_owner_hash" IS NULL) OR ("source" <> 'full_mock' AND "full_mock_run_id" IS NULL AND "full_mock_order" IS NULL));

CREATE TABLE "full_mock_answers" (
  "session_id" uuid NOT NULL REFERENCES "practice_sessions"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "question_id" uuid NOT NULL REFERENCES "questions"("id") ON DELETE RESTRICT,
  "selected_option_id" uuid NOT NULL REFERENCES "question_options"("id") ON DELETE RESTRICT,
  "audio_started_at" timestamptz,
  "answered_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY ("session_id", "question_id")
);
CREATE INDEX "full_mock_answers_user_session_idx" ON "full_mock_answers" ("user_id", "session_id");
