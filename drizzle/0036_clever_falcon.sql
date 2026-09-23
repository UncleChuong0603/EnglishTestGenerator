CREATE TABLE "user_vocabulary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entry_key" text NOT NULL,
	"source_question_id" uuid,
	"context_sentence" text NOT NULL,
	"toeic_part" smallint NOT NULL,
	"due_at" timestamp with time zone DEFAULT now() NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"correct_streak" integer DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_vocabulary_part_check" CHECK ("user_vocabulary"."toeic_part" between 1 and 7),
	CONSTRAINT "user_vocabulary_review_check" CHECK ("user_vocabulary"."interval_days" >= 0 and "user_vocabulary"."correct_streak" >= 0 and "user_vocabulary"."review_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_source_question_id_questions_id_fk" FOREIGN KEY ("source_question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_vocabulary_user_entry_uidx" ON "user_vocabulary" USING btree ("user_id","entry_key");--> statement-breakpoint
CREATE INDEX "user_vocabulary_due_idx" ON "user_vocabulary" USING btree ("user_id","due_at");
