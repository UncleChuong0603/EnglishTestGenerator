DROP INDEX "questions_published_taxonomy_idx";--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD COLUMN "response_type" text DEFAULT 'MULTIPLE_CHOICE' NOT NULL;--> statement-breakpoint
ALTER TABLE "passage_sets" ADD COLUMN "skill_area" text DEFAULT 'READING' NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD COLUMN "skill_area" text DEFAULT 'READING' NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "skill_area" text DEFAULT 'READING' NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "response_type" text DEFAULT 'MULTIPLE_CHOICE' NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT "questions_part_check";--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT "questions_reading_association_check";--> statement-breakpoint
ALTER TABLE "passage_sets" DROP CONSTRAINT "passage_sets_part_type_check";--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_part_check" CHECK (toeic_part BETWEEN 1 AND 7);--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_group_association_check" CHECK ((toeic_part BETWEEN 1 AND 4 AND passage_set_id IS NOT NULL) OR (toeic_part = 5 AND passage_set_id IS NULL AND passage_id IS NULL) OR (toeic_part = 6 AND passage_set_id IS NOT NULL AND passage_id IS NOT NULL) OR (toeic_part = 7 AND passage_set_id IS NOT NULL));--> statement-breakpoint
ALTER TABLE "passage_sets" ADD CONSTRAINT "passage_sets_part_type_check" CHECK ((skill_area = 'LISTENING' AND ((toeic_part = 1 AND set_type = 'part1') OR (toeic_part = 2 AND set_type = 'part2') OR (toeic_part = 3 AND set_type = 'conversation') OR (toeic_part = 4 AND set_type = 'talk'))) OR (skill_area = 'READING' AND ((toeic_part = 6 AND set_type = 'part6') OR (toeic_part = 7 AND set_type IN ('single','double','triple')))));--> statement-breakpoint
CREATE INDEX "questions_published_taxonomy_idx" ON "questions" USING btree ("skill_area","toeic_part","skill","sub_skill","difficulty");--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_response_type_check" CHECK ("attempt_answers"."response_type" = 'MULTIPLE_CHOICE');--> statement-breakpoint
ALTER TABLE "passage_sets" ADD CONSTRAINT "passage_sets_skill_part_check" CHECK (("passage_sets"."skill_area" = 'LISTENING' and "passage_sets"."toeic_part" between 1 and 4) or ("passage_sets"."skill_area" = 'READING' and "passage_sets"."toeic_part" between 5 and 7));--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_skill_part_check" CHECK (("questions"."skill_area" = 'LISTENING' and "questions"."toeic_part" between 1 and 4) or ("questions"."skill_area" = 'READING' and "questions"."toeic_part" between 5 and 7));--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_response_type_check" CHECK ("questions"."response_type" in ('MULTIPLE_CHOICE','TEXT','AUDIO'));
