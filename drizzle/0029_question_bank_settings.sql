CREATE TABLE "question_bank_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"target_forms" smallint DEFAULT 10 NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_bank_settings_singleton_check" CHECK ("question_bank_settings"."id" = 'default'),
	CONSTRAINT "question_bank_settings_target_forms_check" CHECK ("question_bank_settings"."target_forms" between 1 and 100)
);
--> statement-breakpoint
ALTER TABLE "question_bank_settings" ADD CONSTRAINT "question_bank_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_action_check";
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_action_check" CHECK ("admin_audit_logs"."action" in ('ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','USER_SUSPENDED','USER_REACTIVATED','PREMIUM_GRANTED','PREMIUM_REVOKED','CONTENT_DRAFT_CREATED','CONTENT_DRAFT_UPDATED','CONTENT_CLONED','CONTENT_PUBLISHED','CONTENT_ARCHIVED','CONTENT_DRAFT_DISCARDED','CONTENT_UNARCHIVED','CONTENT_DUPLICATE_DELETED','MEDIA_UPLOADED','CHALLENGE_DRAFT_CREATED','CHALLENGE_FORM_GENERATED','CHALLENGE_PUBLISHED','CHALLENGE_CANCELLED','SEO_POST_CREATED','SEO_POST_UPDATED','SEO_POST_PUBLISHED','SEO_POST_UNPUBLISHED','SEO_POST_DELETED','IMPORT_VALIDATED','IMPORT_COMMITTED','IMPORT_FAILED','QUESTION_BANK_BLUEPRINT_UPDATED'));
