ALTER TABLE "question_bank_settings" ADD COLUMN "similarity_threshold_percent" smallint DEFAULT 58 NOT NULL;
--> statement-breakpoint
ALTER TABLE "question_bank_settings" ADD COLUMN "support_response_target_hours" smallint DEFAULT 24 NOT NULL;
--> statement-breakpoint
ALTER TABLE "question_bank_settings" ADD CONSTRAINT "question_bank_settings_similarity_threshold_check" CHECK ("question_bank_settings"."similarity_threshold_percent" between 25 and 95);
--> statement-breakpoint
ALTER TABLE "question_bank_settings" ADD CONSTRAINT "question_bank_settings_support_response_target_check" CHECK ("question_bank_settings"."support_response_target_hours" between 1 and 168);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_action_check";
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_action_check" CHECK ("admin_audit_logs"."action" in ('ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','USER_SUSPENDED','USER_REACTIVATED','PREMIUM_GRANTED','PREMIUM_REVOKED','CONTENT_DRAFT_CREATED','CONTENT_DRAFT_UPDATED','CONTENT_CLONED','CONTENT_PUBLISHED','CONTENT_ARCHIVED','CONTENT_DRAFT_DISCARDED','CONTENT_UNARCHIVED','CONTENT_DUPLICATE_DELETED','MEDIA_UPLOADED','CHALLENGE_DRAFT_CREATED','CHALLENGE_FORM_GENERATED','CHALLENGE_PUBLISHED','CHALLENGE_CANCELLED','SEO_POST_CREATED','SEO_POST_UPDATED','SEO_POST_PUBLISHED','SEO_POST_UNPUBLISHED','SEO_POST_DELETED','IMPORT_VALIDATED','IMPORT_COMMITTED','IMPORT_FAILED','QUESTION_BANK_BLUEPRINT_UPDATED','CONTENT_QUALITY_SETTINGS_UPDATED','SUPPORT_SETTINGS_UPDATED'));
