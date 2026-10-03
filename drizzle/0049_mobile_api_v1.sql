CREATE TABLE "practice_answer_drafts" (
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid NOT NULL,
	"response_time_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "practice_answer_drafts_session_id_question_id_pk" PRIMARY KEY("session_id","question_id"),
	CONSTRAINT "practice_answer_drafts_response_time_check" CHECK ("practice_answer_drafts"."response_time_ms" is null or "practice_answer_drafts"."response_time_ms" between 0 and 86400000)
);
--> statement-breakpoint
CREATE TABLE "api_idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"operation" text NOT NULL,
	"key_hash" text NOT NULL,
	"request_hash" text NOT NULL,
	"response_status" smallint NOT NULL,
	"response_body" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_idempotency_keys_scope_unique" UNIQUE("user_id","operation","key_hash"),
	CONSTRAINT "api_idempotency_keys_status_check" CHECK ("api_idempotency_keys"."response_status" between 200 and 299)
);
--> statement-breakpoint
ALTER TABLE "practice_answer_drafts" ADD CONSTRAINT "practice_answer_drafts_session_id_practice_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "practice_answer_drafts" ADD CONSTRAINT "practice_answer_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "practice_answer_drafts" ADD CONSTRAINT "practice_answer_drafts_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "practice_answer_drafts" ADD CONSTRAINT "practice_answer_drafts_selected_option_id_question_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "api_idempotency_keys" ADD CONSTRAINT "api_idempotency_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "practice_answer_drafts_user_session_idx" ON "practice_answer_drafts" USING btree ("user_id","session_id");
--> statement-breakpoint
CREATE INDEX "api_idempotency_keys_expiry_idx" ON "api_idempotency_keys" USING btree ("expires_at");
