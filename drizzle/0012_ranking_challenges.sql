ALTER TABLE "profiles" ADD COLUMN "ranking_visibility" text DEFAULT 'ANONYMOUS' NOT NULL;
ALTER TABLE "profiles" ADD COLUMN "public_profile_id" uuid DEFAULT gen_random_uuid() NOT NULL;
CREATE UNIQUE INDEX "profiles_public_profile_uidx" ON "profiles" ("public_profile_id");
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_ranking_visibility_check" CHECK ("ranking_visibility" in ('PUBLIC','ANONYMOUS','HIDDEN'));

CREATE TABLE "study_streaks" (
  "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "current_days" integer DEFAULT 0 NOT NULL, "best_days" integer DEFAULT 0 NOT NULL,
  "last_study_date" text, "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "study_streaks_counts_check" CHECK ("current_days" >= 0 AND "best_days" >= "current_days")
);
CREATE TABLE "gamification_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "event_type" text NOT NULL, "source_type" text NOT NULL, "source_id" uuid NOT NULL, "question_id" uuid REFERENCES "questions"("id") ON DELETE RESTRICT,
  "local_date" text NOT NULL, "xp_awarded" integer DEFAULT 0 NOT NULL, "rank_points_awarded" integer DEFAULT 0 NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "gamification_events_source_unique" UNIQUE NULLS NOT DISTINCT ("user_id","event_type","source_type","source_id","question_id"),
  CONSTRAINT "gamification_events_type_check" CHECK ("event_type" in ('QUESTION','STUDY_DAY','STREAK','WORKOUT_COMPLETE','MASTERY_COMPLETE','DIAGNOSTIC_COMPLETE','FULL_MOCK_COMPLETE','CHALLENGE_COMPLETE')),
  CONSTRAINT "gamification_events_points_check" CHECK ("xp_awarded" >= 0 AND "rank_points_awarded" >= 0 AND ("xp_awarded" > 0 OR "rank_points_awarded" > 0))
);
CREATE INDEX "gamification_events_user_created_idx" ON "gamification_events" ("user_id","created_at");
CREATE INDEX "gamification_events_user_date_idx" ON "gamification_events" ("user_id","local_date");
CREATE INDEX "gamification_events_date_rank_idx" ON "gamification_events" ("local_date","rank_points_awarded");

CREATE TABLE "ranked_challenges" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "type" text NOT NULL, "status" text DEFAULT 'DRAFT' NOT NULL,
  "title_en" text NOT NULL, "title_vi" text NOT NULL, "starts_at" timestamptz, "ends_at" timestamptz, "published_at" timestamptz, "cancelled_at" timestamptz,
  "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "ranked_challenges_type_check" CHECK ("type" in ('READING_100','LISTENING_100','FULL_200')),
  CONSTRAINT "ranked_challenges_status_check" CHECK ("status" in ('DRAFT','PUBLISHED','CANCELLED')),
  CONSTRAINT "ranked_challenges_window_check" CHECK ("status"='DRAFT' OR ("starts_at" IS NOT NULL AND "ends_at">"starts_at"))
);
CREATE INDEX "ranked_challenges_status_window_idx" ON "ranked_challenges" ("status","type","starts_at","ends_at");
CREATE TABLE "ranked_challenge_items" (
  "challenge_id" uuid NOT NULL REFERENCES "ranked_challenges"("id") ON DELETE CASCADE, "position" integer NOT NULL, "part" smallint NOT NULL,
  "question_id" uuid NOT NULL REFERENCES "questions"("id") ON DELETE RESTRICT, "group_id" uuid REFERENCES "passage_sets"("id") ON DELETE RESTRICT,
  PRIMARY KEY ("challenge_id","position"), CONSTRAINT "ranked_challenge_question_unique" UNIQUE ("challenge_id","question_id"), CONSTRAINT "ranked_challenge_item_part_check" CHECK ("part" between 1 and 7 AND "position">0)
);
CREATE TABLE "ranked_challenge_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "challenge_id" uuid NOT NULL REFERENCES "ranked_challenges"("id") ON DELETE RESTRICT, "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "full_mock_run_id" uuid REFERENCES "full_mock_runs"("id") ON DELETE RESTRICT, "status" text DEFAULT 'IN_PROGRESS' NOT NULL,
  "listening_score" smallint, "reading_score" smallint, "total_score" smallint, "started_at" timestamptz DEFAULT now() NOT NULL, "completed_at" timestamptz, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "ranked_challenge_runs_user_unique" UNIQUE ("challenge_id","user_id"), CONSTRAINT "ranked_challenge_runs_status_check" CHECK ("status" in ('IN_PROGRESS','COMPLETED','EXPIRED')),
  CONSTRAINT "ranked_challenge_runs_scores_check" CHECK (("listening_score" IS NULL OR "listening_score" between 0 and 100) AND ("reading_score" IS NULL OR "reading_score" between 0 and 100) AND ("total_score" IS NULL OR "total_score" between 0 and 200))
);
CREATE INDEX "ranked_challenge_runs_leaderboard_idx" ON "ranked_challenge_runs" ("challenge_id","status","total_score");
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_action_check";
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_action_check" CHECK ("action" in ('ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','USER_SUSPENDED','USER_REACTIVATED','PREMIUM_GRANTED','PREMIUM_REVOKED','CONTENT_DRAFT_CREATED','CONTENT_DRAFT_UPDATED','CONTENT_PUBLISHED','CONTENT_ARCHIVED','CONTENT_CLONED','CONTENT_DRAFT_DISCARDED','MEDIA_UPLOADED','CHALLENGE_DRAFT_CREATED','CHALLENGE_FORM_GENERATED','CHALLENGE_PUBLISHED','CHALLENGE_CANCELLED'));
