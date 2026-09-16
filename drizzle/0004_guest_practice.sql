ALTER TABLE "practice_sessions" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD COLUMN "guest_owner_hash" text;--> statement-breakpoint
ALTER TABLE "attempt_answers" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS "practice_sessions_one_open_practice_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "practice_sessions_one_open_practice_idx" ON "practice_sessions" USING btree ("user_id") WHERE "status" = 'in_progress' and "practice_type" <> 'demo_test' and "user_id" is not null;--> statement-breakpoint
CREATE INDEX "practice_sessions_guest_created_idx" ON "practice_sessions" USING btree ("guest_owner_hash","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "practice_sessions_one_open_guest_idx" ON "practice_sessions" USING btree ("guest_owner_hash") WHERE "status" = 'in_progress' and "guest_owner_hash" is not null;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_owner_check" CHECK (num_nonnulls("practice_sessions"."user_id", "practice_sessions"."guest_owner_hash") = 1);
--> statement-breakpoint
ALTER TABLE "practice_sessions" DROP CONSTRAINT "practice_sessions_demo_time_check";--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_demo_time_check" CHECK ((practice_type = 'demo_test' AND guest_owner_hash IS NULL AND expires_at > started_at AND ((status = 'in_progress' AND submission_reason IS NULL) OR (status = 'submitted' AND submission_reason IN ('manual','time_expired')) OR status = 'abandoned')) OR (practice_type <> 'demo_test' AND submission_reason IS NULL AND ((guest_owner_hash IS NOT NULL AND expires_at > started_at) OR (guest_owner_hash IS NULL AND expires_at IS NULL))));
