ALTER TABLE "content_posts" DROP CONSTRAINT "content_posts_status_check";--> statement-breakpoint
ALTER TABLE "content_posts" ADD COLUMN "redirect_path" text;--> statement-breakpoint
ALTER TABLE "content_posts" ADD COLUMN "content_origin" text DEFAULT 'MIGRATED' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_posts" ADD COLUMN "last_reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_origin_check" CHECK ("content_posts"."content_origin" in ('HUMAN','AI_ASSISTED','MIGRATED'));--> statement-breakpoint
ALTER TABLE "content_posts" ADD CONSTRAINT "content_posts_status_check" CHECK ("content_posts"."status" in ('DRAFT','PUBLISHED','UNPUBLISHED','ARCHIVED'));