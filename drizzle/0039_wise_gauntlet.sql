ALTER TABLE "questions" ADD COLUMN "bank_pool" text DEFAULT 'PRACTICE' NOT NULL;--> statement-breakpoint
UPDATE "questions" AS q SET "bank_pool" = 'MOCK'
FROM "full_mock_form_questions" AS f
WHERE f."question_id" = q."id";--> statement-breakpoint
CREATE INDEX "questions_published_pool_part_id_idx" ON "questions" USING btree ("bank_pool","toeic_part","id") WHERE "questions"."status" = 'published';--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_bank_pool_check" CHECK ("questions"."bank_pool" in ('MOCK','PRACTICE'));
