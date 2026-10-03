CREATE TABLE "remediation_session_contexts" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"source_session_id" uuid NOT NULL,
	"source_question_id" uuid NOT NULL,
	"reason_code" text NOT NULL,
	"lesson_kind" text NOT NULL,
	"lesson_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "remediation_context_reason_check" CHECK ("reason_code" in ('VOCAB_UNKNOWN','GRAMMAR_RULE','PARAPHRASE_MISSED','DISTRACTOR_TRAP','MISHEARD_WORD','LOST_CONTEXT','INFERENCE_ERROR','TIME_PRESSURE','CARELESS','OTHER','UNKNOWN')),
	CONSTRAINT "remediation_context_lesson_kind_check" CHECK ("lesson_kind" in ('GRAMMAR_ARTICLE','LISTENING_LESSON','QUESTION_EXPLANATION')),
	CONSTRAINT "remediation_context_lesson_ref_check" CHECK (("lesson_kind" = 'QUESTION_EXPLANATION' and "lesson_ref" is null) or ("lesson_kind" <> 'QUESTION_EXPLANATION' and "lesson_ref" is not null))
);
--> statement-breakpoint
ALTER TABLE "remediation_session_contexts" ADD CONSTRAINT "remediation_session_contexts_session_id_practice_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "remediation_session_contexts" ADD CONSTRAINT "remediation_session_contexts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "remediation_session_contexts" ADD CONSTRAINT "remediation_session_contexts_source_session_id_practice_sessions_id_fk" FOREIGN KEY ("source_session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "remediation_session_contexts" ADD CONSTRAINT "remediation_session_contexts_source_question_id_questions_id_fk" FOREIGN KEY ("source_question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "remediation_context_user_question_idx" ON "remediation_session_contexts" USING btree ("user_id","source_question_id","created_at");
--> statement-breakpoint
CREATE INDEX "remediation_context_source_session_idx" ON "remediation_session_contexts" USING btree ("source_session_id");
