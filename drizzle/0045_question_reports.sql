CREATE TABLE "question_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"question_group_id" uuid,
	"practice_session_id" uuid,
	"reporter_user_id" uuid,
	"guest_owner_hash" text,
	"source_type" text NOT NULL,
	"reason" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"resolution_note" text,
	"reviewed_by" uuid,
	"remediation_group_id" uuid,
	"reviewed_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_reports_actor_check" CHECK (num_nonnulls("question_reports"."reporter_user_id", "question_reports"."guest_owner_hash") = 1),
	CONSTRAINT "question_reports_source_check" CHECK ("question_reports"."source_type" in ('PRACTICE','DIAGNOSTIC','CHALLENGE','MISTAKE_REVIEW','FULL_MOCK')),
	CONSTRAINT "question_reports_reason_check" CHECK ("question_reports"."reason" in ('ANSWER_INCORRECT','EXPLANATION_ISSUE','AMBIGUOUS','TYPO_GRAMMAR','MEDIA_BROKEN','OTHER')),
	CONSTRAINT "question_reports_status_check" CHECK ("question_reports"."status" in ('OPEN','IN_REVIEW','RESOLVED','DISMISSED')),
	CONSTRAINT "question_reports_description_length_check" CHECK ("question_reports"."description" is null or char_length("question_reports"."description") between 1 and 500),
	CONSTRAINT "question_reports_resolution_length_check" CHECK ("question_reports"."resolution_note" is null or char_length("question_reports"."resolution_note") between 1 and 1000),
	CONSTRAINT "question_reports_resolution_check" CHECK (("question_reports"."status" in ('RESOLVED','DISMISSED') and "question_reports"."resolved_at" is not null and "question_reports"."resolution_note" is not null) or ("question_reports"."status" in ('OPEN','IN_REVIEW') and "question_reports"."resolved_at" is null))
);
--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_question_group_id_passage_sets_id_fk" FOREIGN KEY ("question_group_id") REFERENCES "public"."passage_sets"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_practice_session_id_practice_sessions_id_fk" FOREIGN KEY ("practice_session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_remediation_group_id_passage_sets_id_fk" FOREIGN KEY ("remediation_group_id") REFERENCES "public"."passage_sets"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "question_reports_status_created_idx" ON "question_reports" USING btree ("status","created_at");
--> statement-breakpoint
CREATE INDEX "question_reports_question_status_idx" ON "question_reports" USING btree ("question_id","status");
--> statement-breakpoint
CREATE INDEX "question_reports_reason_status_idx" ON "question_reports" USING btree ("reason","status");
--> statement-breakpoint
CREATE INDEX "question_reports_user_created_idx" ON "question_reports" USING btree ("reporter_user_id","created_at");
--> statement-breakpoint
CREATE INDEX "question_reports_guest_created_idx" ON "question_reports" USING btree ("guest_owner_hash","created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "question_reports_active_user_question_uidx" ON "question_reports" USING btree ("reporter_user_id","question_id") WHERE "question_reports"."reporter_user_id" is not null and "question_reports"."status" in ('OPEN','IN_REVIEW');
--> statement-breakpoint
CREATE UNIQUE INDEX "question_reports_active_guest_question_uidx" ON "question_reports" USING btree ("guest_owner_hash","question_id") WHERE "question_reports"."guest_owner_hash" is not null and "question_reports"."status" in ('OPEN','IN_REVIEW');
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_action_check";
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_action_check" CHECK ("admin_audit_logs"."action" in ('ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','USER_SUSPENDED','USER_REACTIVATED','PREMIUM_GRANTED','PREMIUM_REVOKED','CONTENT_DRAFT_CREATED','CONTENT_DRAFT_UPDATED','CONTENT_CLONED','CONTENT_PUBLISHED','CONTENT_ARCHIVED','CONTENT_DRAFT_DISCARDED','CONTENT_UNARCHIVED','CONTENT_DUPLICATE_DELETED','MEDIA_UPLOADED','CHALLENGE_DRAFT_CREATED','CHALLENGE_FORM_GENERATED','CHALLENGE_PUBLISHED','CHALLENGE_CANCELLED','SEO_POST_CREATED','SEO_POST_UPDATED','SEO_POST_PUBLISHED','SEO_POST_UNPUBLISHED','SEO_POST_DELETED','IMPORT_VALIDATED','IMPORT_COMMITTED','IMPORT_FAILED','QUESTION_BANK_BLUEPRINT_UPDATED','CONTENT_QUALITY_SETTINGS_UPDATED','SUPPORT_SETTINGS_UPDATED','LISTENING_LESSON_CREATED','LISTENING_LESSON_UPDATED','LISTENING_LESSON_PUBLISHED','LISTENING_LESSON_ARCHIVED','QUESTION_REPORT_REVIEW_STARTED','QUESTION_REPORT_RESOLVED','QUESTION_REPORT_DISMISSED','QUESTION_REPORT_CORRECTION_DRAFTED'));
