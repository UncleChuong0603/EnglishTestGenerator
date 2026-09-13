CREATE TABLE "account_activation_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "attempt_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid,
	"is_correct" boolean NOT NULL,
	"response_time_ms" integer,
	"answered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempt_answers_session_question_unique" UNIQUE("session_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"provider_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_identities_provider_account_unique" UNIQUE("provider","provider_account_id"),
	CONSTRAINT "auth_identities_user_provider_unique" UNIQUE("user_id","provider"),
	CONSTRAINT "auth_identities_provider_check" CHECK ("auth_identities"."provider" in ('google'))
);
--> statement-breakpoint
CREATE TABLE "auth_rate_limits" (
	"key_hash" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"blocked_until" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_test_answers" (
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid NOT NULL,
	"response_time_ms" integer,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "demo_test_answers_session_id_question_id_pk" PRIMARY KEY("session_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "oauth_states" (
	"state_hash" text PRIMARY KEY NOT NULL,
	"code_verifier" text NOT NULL,
	"link_user_id" uuid,
	"return_to" text DEFAULT '/dashboard' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passage_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"toeic_part" smallint NOT NULL,
	"set_type" text NOT NULL,
	"title" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"toeic_part" smallint NOT NULL,
	"passage_type" text NOT NULL,
	"title" text,
	"content" text,
	"audio_url" text,
	"image_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"passage_set_id" uuid,
	"position" smallint,
	"document_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "passages_set_position_unique" UNIQUE("passage_set_id","position")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "practice_session_questions" (
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"display_order" smallint NOT NULL,
	"passage_set_id" uuid,
	CONSTRAINT "practice_session_questions_session_id_question_id_pk" PRIMARY KEY("session_id","question_id"),
	CONSTRAINT "practice_session_questions_order_unique" UNIQUE("session_id","display_order")
);
--> statement-breakpoint
CREATE TABLE "practice_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"practice_type" text DEFAULT 'part_5' NOT NULL,
	"part" smallint,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"question_count" smallint NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"score_correct" smallint,
	"score_total" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text DEFAULT 'custom' NOT NULL,
	"requested_question_count" smallint DEFAULT 10 NOT NULL,
	"requested_skill" text,
	"requested_sub_skill" text,
	"expires_at" timestamp with time zone,
	"submission_reason" text,
	CONSTRAINT "practice_sessions_id_user_unique" UNIQUE("id","user_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"interface_language" text DEFAULT 'vi' NOT NULL,
	"explanation_language" text DEFAULT 'both' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_interface_language_check" CHECK ("profiles"."interface_language" in ('en', 'vi')),
	CONSTRAINT "profiles_explanation_language_check" CHECK ("profiles"."explanation_language" in ('en', 'vi', 'both'))
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option_key" text NOT NULL,
	"option_text" text NOT NULL,
	"display_order" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_options_key_unique" UNIQUE("question_id","option_key"),
	CONSTRAINT "question_options_order_unique" UNIQUE("question_id","display_order"),
	CONSTRAINT "question_options_id_question_unique" UNIQUE("id","question_id")
);
--> statement-breakpoint
CREATE TABLE "question_solutions" (
	"question_id" uuid PRIMARY KEY NOT NULL,
	"correct_option_id" uuid NOT NULL,
	"explanation_en" text,
	"explanation_vi" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"toeic_part" smallint NOT NULL,
	"question_type" text NOT NULL,
	"skill" text NOT NULL,
	"sub_skill" text NOT NULL,
	"difficulty" text NOT NULL,
	"question_text" text NOT NULL,
	"passage_id" uuid,
	"audio_url" text,
	"image_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"passage_set_id" uuid,
	"question_order" smallint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_set_order_unique" UNIQUE("passage_set_id","question_order")
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event_type" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_normalized" text NOT NULL,
	"password_hash" text,
	"email_verified_at" timestamp with time zone,
	"status" text DEFAULT 'pending_verification' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_status_check" CHECK ("users"."status" in ('active', 'disabled', 'pending_verification'))
);
--> statement-breakpoint
ALTER TABLE "account_activation_tokens" ADD CONSTRAINT "account_activation_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_session_id_practice_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_selected_option_id_question_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_test_answers" ADD CONSTRAINT "demo_test_answers_session_id_practice_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_test_answers" ADD CONSTRAINT "demo_test_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_test_answers" ADD CONSTRAINT "demo_test_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_test_answers" ADD CONSTRAINT "demo_test_answers_selected_option_id_question_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_states" ADD CONSTRAINT "oauth_states_link_user_id_users_id_fk" FOREIGN KEY ("link_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passages" ADD CONSTRAINT "passages_passage_set_id_passage_sets_id_fk" FOREIGN KEY ("passage_set_id") REFERENCES "public"."passage_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_session_questions" ADD CONSTRAINT "practice_session_questions_session_id_practice_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_session_questions" ADD CONSTRAINT "practice_session_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_session_questions" ADD CONSTRAINT "practice_session_questions_passage_set_id_passage_sets_id_fk" FOREIGN KEY ("passage_set_id") REFERENCES "public"."passage_sets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_solutions" ADD CONSTRAINT "question_solutions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_solutions" ADD CONSTRAINT "question_solutions_correct_option_id_question_options_id_fk" FOREIGN KEY ("correct_option_id") REFERENCES "public"."question_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_passage_id_passages_id_fk" FOREIGN KEY ("passage_id") REFERENCES "public"."passages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_passage_set_id_passage_sets_id_fk" FOREIGN KEY ("passage_set_id") REFERENCES "public"."passage_sets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_activation_tokens_hash_uidx" ON "account_activation_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "account_activation_tokens_user_idx" ON "account_activation_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "attempt_answers_user_session_idx" ON "attempt_answers" USING btree ("user_id","session_id");--> statement-breakpoint
CREATE INDEX "demo_test_answers_user_session_idx" ON "demo_test_answers" USING btree ("user_id","session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_verification_tokens_hash_uidx" ON "email_verification_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_user_idx" ON "email_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_hash_uidx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "practice_sessions_user_created_idx" ON "practice_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "practice_sessions_one_open_practice_idx" ON "practice_sessions" USING btree ("user_id") WHERE "practice_sessions"."status" = 'in_progress' and "practice_sessions"."practice_type" <> 'demo_test';--> statement-breakpoint
CREATE UNIQUE INDEX "practice_sessions_one_open_demo_idx" ON "practice_sessions" USING btree ("user_id") WHERE "practice_sessions"."status" = 'in_progress' and "practice_sessions"."practice_type" = 'demo_test';--> statement-breakpoint
CREATE INDEX "questions_published_taxonomy_idx" ON "questions" USING btree ("toeic_part","skill","sub_skill","difficulty");--> statement-breakpoint
CREATE INDEX "security_events_user_created_idx" ON "security_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_sessions_token_uidx" ON "user_sessions" USING btree ("session_token_hash");--> statement-breakpoint
CREATE INDEX "user_sessions_user_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_normalized_uidx" ON "users" USING btree ("email_normalized");
--> statement-breakpoint
ALTER TABLE "passage_sets" ADD CONSTRAINT "passage_sets_part_type_check" CHECK ((toeic_part = 6 AND set_type = 'part6') OR (toeic_part = 7 AND set_type IN ('single','double','triple')));
--> statement-breakpoint
ALTER TABLE "passage_sets" ADD CONSTRAINT "passage_sets_status_check" CHECK (status IN ('draft','published','archived'));
--> statement-breakpoint
ALTER TABLE "passages" ADD CONSTRAINT "passages_status_check" CHECK (status IN ('draft','published','archived'));
--> statement-breakpoint
ALTER TABLE "passages" ADD CONSTRAINT "passages_position_check" CHECK (position IS NULL OR position > 0);
--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_part_check" CHECK (toeic_part BETWEEN 5 AND 7);
--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_difficulty_check" CHECK (difficulty IN ('easy','medium','hard'));
--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_status_check" CHECK (status IN ('draft','published','archived'));
--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_reading_association_check" CHECK ((toeic_part = 5 AND passage_set_id IS NULL AND passage_id IS NULL) OR (toeic_part = 6 AND passage_set_id IS NOT NULL AND passage_id IS NOT NULL) OR (toeic_part = 7 AND passage_set_id IS NOT NULL));
--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_id_set_unique" UNIQUE ("id", "passage_set_id");
--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_order_check" CHECK (display_order > 0);
--> statement-breakpoint
ALTER TABLE "question_solutions" ADD CONSTRAINT "question_solutions_explanation_check" CHECK (coalesce(explanation_en, explanation_vi) IS NOT NULL);
--> statement-breakpoint
ALTER TABLE "question_solutions" ADD CONSTRAINT "question_solutions_option_question_fk" FOREIGN KEY ("correct_option_id", "question_id") REFERENCES "question_options"("id", "question_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_type_check" CHECK (practice_type IN ('part_5','part_6','part_7','mixed_reading','demo_test'));
--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_status_check" CHECK (status IN ('in_progress','submitted','abandoned'));
--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_source_check" CHECK (source IN ('recommended','custom','demo_test'));
--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_count_check" CHECK (question_count BETWEEN 1 AND 100 AND requested_question_count IN (10,15,20,100));
--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_part_check" CHECK ((practice_type IN ('mixed_reading','demo_test') AND part IS NULL) OR (practice_type = 'part_5' AND part = 5) OR (practice_type = 'part_6' AND part = 6) OR (practice_type = 'part_7' AND part = 7));
--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_result_check" CHECK ((status IN ('in_progress','abandoned') AND submitted_at IS NULL AND score_correct IS NULL AND score_total IS NULL) OR (status = 'submitted' AND submitted_at IS NOT NULL AND score_correct BETWEEN 0 AND score_total AND score_total = question_count));
--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_demo_time_check" CHECK ((practice_type <> 'demo_test' AND expires_at IS NULL AND submission_reason IS NULL) OR (practice_type = 'demo_test' AND expires_at > started_at AND ((status = 'in_progress' AND submission_reason IS NULL) OR (status = 'submitted' AND submission_reason IN ('manual','time_expired')) OR status = 'abandoned')));
--> statement-breakpoint
ALTER TABLE "practice_session_questions" ADD CONSTRAINT "practice_assignment_question_set_fk" FOREIGN KEY ("question_id", "passage_set_id") REFERENCES "questions"("id", "passage_set_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_time_check" CHECK (response_time_ms IS NULL OR response_time_ms BETWEEN 0 AND 86400000);
--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_session_user_fk" FOREIGN KEY ("session_id", "user_id") REFERENCES "practice_sessions"("id", "user_id") ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_session_question_fk" FOREIGN KEY ("session_id", "question_id") REFERENCES "practice_session_questions"("session_id", "question_id") ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_option_question_fk" FOREIGN KEY ("selected_option_id", "question_id") REFERENCES "question_options"("id", "question_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "demo_test_answers" ADD CONSTRAINT "demo_answers_time_check" CHECK (response_time_ms IS NULL OR response_time_ms BETWEEN 0 AND 86400000);
--> statement-breakpoint
ALTER TABLE "demo_test_answers" ADD CONSTRAINT "demo_answers_session_user_fk" FOREIGN KEY ("session_id", "user_id") REFERENCES "practice_sessions"("id", "user_id") ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE "demo_test_answers" ADD CONSTRAINT "demo_answers_session_question_fk" FOREIGN KEY ("session_id", "question_id") REFERENCES "practice_session_questions"("session_id", "question_id") ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE "demo_test_answers" ADD CONSTRAINT "demo_answers_option_question_fk" FOREIGN KEY ("selected_option_id", "question_id") REFERENCES "question_options"("id", "question_id") ON DELETE restrict;
