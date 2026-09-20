ALTER TABLE "diagnostic_runs" ADD COLUMN "blueprint_version" text;--> statement-breakpoint
ALTER TABLE "diagnostic_runs" ADD COLUMN "purpose" text DEFAULT 'BASELINE' NOT NULL;--> statement-breakpoint
ALTER TABLE "diagnostic_runs" ADD CONSTRAINT "diagnostic_runs_purpose_check" CHECK ("purpose" in ('BASELINE','REASSESSMENT'));--> statement-breakpoint
CREATE INDEX "diagnostic_runs_user_status_completed_blueprint_idx" ON "diagnostic_runs" ("user_id","status","completed_at","blueprint_version");
-- Existing rows intentionally remain blueprint_version NULL. Their historical
-- selection inputs cannot be proven after the fact, so they stay readable but
-- are never silently compared with the canonical version introduced here.
