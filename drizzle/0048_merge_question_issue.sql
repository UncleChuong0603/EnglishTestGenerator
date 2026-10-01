CREATE TABLE "question_duplicate_scans" (
	"toeic_part" smallint PRIMARY KEY NOT NULL,
	"content_version" text NOT NULL,
	"scanned_count" integer NOT NULL,
	"detected_count" integer NOT NULL,
	"threshold_percent" smallint NOT NULL,
	"scanned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_duplicate_scans_part_check" CHECK ("question_duplicate_scans"."toeic_part" between 1 and 7),
	CONSTRAINT "question_duplicate_scans_counts_check" CHECK ("question_duplicate_scans"."scanned_count" >= 0 and "question_duplicate_scans"."detected_count" >= 0),
	CONSTRAINT "question_duplicate_scans_threshold_check" CHECK ("question_duplicate_scans"."threshold_percent" between 25 and 95)
);
--> statement-breakpoint
CREATE TABLE "question_issue_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fingerprint" text NOT NULL,
	"source" text DEFAULT 'SYSTEM' NOT NULL,
	"issue_type" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"toeic_part" smallint NOT NULL,
	"primary_group_id" uuid NOT NULL,
	"related_group_id" uuid,
	"confidence_percent" smallint,
	"evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_issue_reports_source_check" CHECK ("question_issue_reports"."source" in ('SYSTEM','LEARNER')),
	CONSTRAINT "question_issue_reports_type_check" CHECK ("question_issue_reports"."issue_type" in ('DUPLICATE','CONTENT_ERROR','ANSWER_ERROR','MEDIA_ERROR','OTHER')),
	CONSTRAINT "question_issue_reports_status_check" CHECK ("question_issue_reports"."status" in ('OPEN','IN_REVIEW','RESOLVED','DISMISSED')),
	CONSTRAINT "question_issue_reports_part_check" CHECK ("question_issue_reports"."toeic_part" between 1 and 7),
	CONSTRAINT "question_issue_reports_confidence_check" CHECK ("question_issue_reports"."confidence_percent" is null or "question_issue_reports"."confidence_percent" between 0 and 100),
	CONSTRAINT "question_issue_reports_pair_check" CHECK ("question_issue_reports"."issue_type" <> 'DUPLICATE' or ("question_issue_reports"."related_group_id" is not null and "question_issue_reports"."primary_group_id" <> "question_issue_reports"."related_group_id"))
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_action_check";--> statement-breakpoint
ALTER TABLE "question_issue_reports" ADD CONSTRAINT "question_issue_reports_primary_group_id_passage_sets_id_fk" FOREIGN KEY ("primary_group_id") REFERENCES "public"."passage_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_issue_reports" ADD CONSTRAINT "question_issue_reports_related_group_id_passage_sets_id_fk" FOREIGN KEY ("related_group_id") REFERENCES "public"."passage_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_issue_reports" ADD CONSTRAINT "question_issue_reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "question_issue_reports_fingerprint_uidx" ON "question_issue_reports" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "question_issue_reports_queue_idx" ON "question_issue_reports" USING btree ("status","issue_type","last_detected_at");--> statement-breakpoint
CREATE INDEX "question_issue_reports_part_idx" ON "question_issue_reports" USING btree ("toeic_part","status");--> statement-breakpoint
CREATE INDEX "question_issue_reports_primary_group_idx" ON "question_issue_reports" USING btree ("primary_group_id");--> statement-breakpoint
CREATE INDEX "question_issue_reports_related_group_idx" ON "question_issue_reports" USING btree ("related_group_id");--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_action_check" CHECK ("admin_audit_logs"."action" in ('ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','USER_SUSPENDED','USER_REACTIVATED','PREMIUM_GRANTED','PREMIUM_REVOKED','CONTENT_DRAFT_CREATED','CONTENT_DRAFT_UPDATED','CONTENT_CLONED','CONTENT_PUBLISHED','CONTENT_ARCHIVED','CONTENT_DRAFT_DISCARDED','CONTENT_UNARCHIVED','CONTENT_DUPLICATE_DELETED','QUESTION_REPORT_STATUS_UPDATED','MEDIA_UPLOADED','CHALLENGE_DRAFT_CREATED','CHALLENGE_FORM_GENERATED','CHALLENGE_PUBLISHED','CHALLENGE_CANCELLED','SEO_POST_CREATED','SEO_POST_UPDATED','SEO_POST_PUBLISHED','SEO_POST_UNPUBLISHED','SEO_POST_DELETED','IMPORT_VALIDATED','IMPORT_COMMITTED','IMPORT_FAILED','QUESTION_BANK_BLUEPRINT_UPDATED','CONTENT_QUALITY_SETTINGS_UPDATED','SUPPORT_SETTINGS_UPDATED','LISTENING_LESSON_CREATED','LISTENING_LESSON_UPDATED','LISTENING_LESSON_PUBLISHED','LISTENING_LESSON_ARCHIVED','QUESTION_REPORT_REVIEW_STARTED','QUESTION_REPORT_RESOLVED','QUESTION_REPORT_DISMISSED','QUESTION_REPORT_CORRECTION_DRAFTED'));