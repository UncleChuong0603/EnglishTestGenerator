ALTER TABLE "full_mock_runs" ADD COLUMN "mode" text DEFAULT 'FULL' NOT NULL;
ALTER TABLE "full_mock_runs" ALTER COLUMN "listening_started_at" DROP NOT NULL;
ALTER TABLE "full_mock_runs" ALTER COLUMN "listening_started_at" DROP DEFAULT;
ALTER TABLE "full_mock_runs" ALTER COLUMN "listening_deadline" DROP NOT NULL;
ALTER TABLE "full_mock_runs" ADD CONSTRAINT "full_mock_runs_mode_check" CHECK ("mode" IN ('LISTENING','READING','FULL'));
ALTER TABLE "full_mock_runs" ADD CONSTRAINT "full_mock_runs_mode_sections_check" CHECK (
  ("mode"='LISTENING' AND "listening_started_at" IS NOT NULL AND "listening_deadline" IS NOT NULL AND "reading_started_at" IS NULL AND "reading_deadline" IS NULL)
  OR ("mode"='READING' AND "listening_started_at" IS NULL AND "listening_deadline" IS NULL AND "reading_started_at" IS NOT NULL AND "reading_deadline" IS NOT NULL)
  OR ("mode"='FULL' AND "listening_started_at" IS NOT NULL AND "listening_deadline" IS NOT NULL)
);
DROP INDEX "full_mock_runs_one_active_user_idx";
CREATE UNIQUE INDEX "full_mock_runs_one_active_user_mode_idx" ON "full_mock_runs" ("user_id", "mode") WHERE "status" IN ('LISTENING','READING');
