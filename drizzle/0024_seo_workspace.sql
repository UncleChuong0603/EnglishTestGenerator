ALTER TABLE "content_posts" ADD COLUMN "noindex" boolean DEFAULT false NOT NULL;
ALTER TABLE "content_posts" ADD COLUMN "author_name" text;
ALTER TABLE "content_posts" ADD COLUMN "cover_alt" text;
ALTER TABLE "content_posts" ADD COLUMN "social_title" text;
ALTER TABLE "content_posts" ADD COLUMN "social_description" text;
ALTER TABLE "content_posts" ADD COLUMN "target_topic" text;
ALTER TABLE "content_posts" ADD COLUMN "search_intent" text;
