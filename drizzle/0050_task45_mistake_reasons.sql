CREATE TABLE "mistake_reason_classifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"reason_code" text NOT NULL,
	"evidence_source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mistake_reason_user_attempt_unique" UNIQUE("user_id","session_id","question_id"),
	CONSTRAINT "mistake_reason_code_check" CHECK ("reason_code" in ('VOCAB_UNKNOWN','GRAMMAR_RULE','PARAPHRASE_MISSED','DISTRACTOR_TRAP','MISHEARD_WORD','LOST_CONTEXT','INFERENCE_ERROR','TIME_PRESSURE','CARELESS','OTHER','UNKNOWN')),
	CONSTRAINT "mistake_reason_evidence_check" CHECK ("evidence_source" in ('USER_SELECTED','SYSTEM_INFERRED','SYSTEM_SUGGESTED'))
);
--> statement-breakpoint
ALTER TABLE "mistake_reason_classifications" ADD CONSTRAINT "mistake_reason_classifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "mistake_reason_classifications" ADD CONSTRAINT "mistake_reason_classifications_session_id_practice_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "mistake_reason_classifications" ADD CONSTRAINT "mistake_reason_classifications_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "mistake_reason_user_created_idx" ON "mistake_reason_classifications" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX "mistake_reason_user_code_idx" ON "mistake_reason_classifications" USING btree ("user_id","reason_code");
