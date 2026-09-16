CREATE TABLE "diagnostic_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "guest_owner_hash" text,
  "status" text DEFAULT 'IN_PROGRESS' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "completed_at" timestamp with time zone,
  CONSTRAINT "diagnostic_runs_owner_check" CHECK (num_nonnulls("user_id", "guest_owner_hash") = 1),
  CONSTRAINT "diagnostic_runs_status_check" CHECK ("status" in ('IN_PROGRESS','COMPLETED','EXPIRED')),
  CONSTRAINT "diagnostic_runs_lifecycle_check" CHECK (("status" = 'COMPLETED' and "completed_at" is not null) or ("status" <> 'COMPLETED' and "completed_at" is null))
);--> statement-breakpoint
ALTER TABLE "diagnostic_runs" ADD CONSTRAINT "diagnostic_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;--> statement-breakpoint
CREATE INDEX "diagnostic_runs_user_created_idx" ON "diagnostic_runs" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "diagnostic_runs_guest_created_idx" ON "diagnostic_runs" ("guest_owner_hash","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "diagnostic_runs_one_active_user_idx" ON "diagnostic_runs" ("user_id") WHERE "status" = 'IN_PROGRESS' and "user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "diagnostic_runs_one_active_guest_idx" ON "diagnostic_runs" ("guest_owner_hash") WHERE "status" = 'IN_PROGRESS' and "guest_owner_hash" is not null;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD COLUMN "diagnostic_run_id" uuid;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD COLUMN "diagnostic_order" smallint;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_diagnostic_run_id_fk" FOREIGN KEY ("diagnostic_run_id") REFERENCES "public"."diagnostic_runs"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_diagnostic_order_unique" UNIQUE("diagnostic_run_id","diagnostic_order");--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_diagnostic_link_check" CHECK (("source" = 'diagnostic' and "diagnostic_run_id" is not null and "diagnostic_order" between 1 and 7) or ("source" <> 'diagnostic' and "diagnostic_run_id" is null and "diagnostic_order" is null));--> statement-breakpoint
ALTER TABLE "practice_sessions" DROP CONSTRAINT IF EXISTS "practice_sessions_source_check";--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_source_check" CHECK ("source" in ('recommended','custom','demo_test','guest','diagnostic'));--> statement-breakpoint
ALTER TABLE "practice_sessions" DROP CONSTRAINT IF EXISTS "practice_sessions_demo_time_check";--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_demo_time_check" CHECK ((practice_type = 'demo_test' AND guest_owner_hash IS NULL AND expires_at > started_at AND ((status = 'in_progress' AND submission_reason IS NULL) OR (status = 'submitted' AND submission_reason IN ('manual','time_expired')) OR status = 'abandoned')) OR (practice_type <> 'demo_test' AND submission_reason IS NULL AND ((guest_owner_hash IS NOT NULL AND expires_at > started_at) OR (guest_owner_hash IS NULL AND (expires_at IS NULL OR source = 'diagnostic')))));--> statement-breakpoint
DROP INDEX IF EXISTS "practice_sessions_one_open_practice_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "practice_sessions_one_open_practice_idx" ON "practice_sessions" ("user_id") WHERE "status" = 'in_progress' and "practice_type" <> 'demo_test' and "source" <> 'diagnostic' and "user_id" is not null;--> statement-breakpoint
DROP INDEX IF EXISTS "practice_sessions_one_open_guest_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "practice_sessions_one_open_guest_idx" ON "practice_sessions" ("guest_owner_hash") WHERE "status" = 'in_progress' and "source" <> 'diagnostic' and "guest_owner_hash" is not null;
