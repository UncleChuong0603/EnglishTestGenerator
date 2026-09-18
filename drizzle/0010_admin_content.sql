ALTER TABLE "passage_sets" ADD COLUMN "provenance" text DEFAULT 'SEEDED' NOT NULL;
ALTER TABLE "passage_sets" ADD COLUMN "revision_of_id" uuid;
ALTER TABLE "passage_sets" ADD COLUMN "published_at" timestamp with time zone;
ALTER TABLE "passage_sets" ADD COLUMN "archived_at" timestamp with time zone;
ALTER TABLE "questions" ADD COLUMN "provenance" text DEFAULT 'SEEDED' NOT NULL;
ALTER TABLE "questions" ADD COLUMN "revision_of_id" uuid;
ALTER TABLE "questions" ADD COLUMN "published_at" timestamp with time zone;
ALTER TABLE "questions" ADD COLUMN "archived_at" timestamp with time zone;

UPDATE "passage_sets" SET "published_at" = COALESCE("published_at", "created_at") WHERE "status" = 'published';
UPDATE "questions" SET "published_at" = COALESCE("published_at", "created_at") WHERE "status" = 'published';

ALTER TABLE "passage_sets" ADD CONSTRAINT "passage_sets_lifecycle_check" CHECK ("status" in ('draft','published','archived'));
ALTER TABLE "passage_sets" ADD CONSTRAINT "passage_sets_provenance_check" CHECK ("provenance" in ('SEEDED','ADMIN'));
ALTER TABLE "questions" ADD CONSTRAINT "questions_lifecycle_check" CHECK ("status" in ('draft','published','archived'));
ALTER TABLE "questions" ADD CONSTRAINT "questions_provenance_check" CHECK ("provenance" in ('SEEDED','ADMIN'));
CREATE INDEX "passage_sets_admin_list_idx" ON "passage_sets" USING btree ("status","skill_area","toeic_part","updated_at");
CREATE INDEX "questions_admin_list_idx" ON "questions" USING btree ("status","skill_area","toeic_part","updated_at");

ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_action_check";
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_action_check" CHECK ("action" in ('ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','USER_SUSPENDED','USER_REACTIVATED','PREMIUM_GRANTED','PREMIUM_REVOKED','CONTENT_DRAFT_CREATED','CONTENT_DRAFT_UPDATED','CONTENT_CLONED','CONTENT_PUBLISHED','CONTENT_ARCHIVED','CONTENT_DRAFT_DISCARDED','MEDIA_UPLOADED'));
