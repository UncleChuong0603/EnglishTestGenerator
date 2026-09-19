CREATE TABLE "content_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL, "slug" text NOT NULL, "excerpt" text DEFAULT '' NOT NULL,
  "content" text DEFAULT '' NOT NULL, "status" text DEFAULT 'DRAFT' NOT NULL,
  "category" text DEFAULT 'TOEIC_STRATEGY' NOT NULL, "seo_title" text, "seo_description" text,
  "canonical_path" text, "cover_media_id" uuid REFERENCES "media_assets"("id") ON DELETE set null,
  "published_at" timestamptz, "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "updated_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "content_posts_status_check" CHECK ("status" in ('DRAFT','PUBLISHED','UNPUBLISHED')),
  CONSTRAINT "content_posts_slug_check" CHECK ("slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
CREATE UNIQUE INDEX "content_posts_slug_uidx" ON "content_posts" ("slug");
CREATE INDEX "content_posts_public_idx" ON "content_posts" ("status","published_at");
CREATE INDEX "content_posts_admin_idx" ON "content_posts" ("updated_at","status");
CREATE TABLE "content_tags" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "name" text NOT NULL, "slug" text NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL);
CREATE UNIQUE INDEX "content_tags_slug_uidx" ON "content_tags" ("slug");
CREATE TABLE "content_post_tags" ("post_id" uuid NOT NULL REFERENCES "content_posts"("id") ON DELETE cascade, "tag_id" uuid NOT NULL REFERENCES "content_tags"("id") ON DELETE cascade, PRIMARY KEY("post_id","tag_id"));
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_action_check";
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_action_check" CHECK ("action" in ('ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','USER_SUSPENDED','USER_REACTIVATED','PREMIUM_GRANTED','PREMIUM_REVOKED','CONTENT_DRAFT_CREATED','CONTENT_DRAFT_UPDATED','CONTENT_CLONED','CONTENT_PUBLISHED','CONTENT_ARCHIVED','CONTENT_DRAFT_DISCARDED','MEDIA_UPLOADED','SEO_POST_CREATED','SEO_POST_UPDATED','SEO_POST_PUBLISHED','SEO_POST_UNPUBLISHED','SEO_POST_DELETED'));
