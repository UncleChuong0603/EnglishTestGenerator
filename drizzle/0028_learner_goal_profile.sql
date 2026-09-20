CREATE TABLE "learner_goals" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"target_score" smallint,
	"exam_date" date,
	"daily_study_minutes" smallint,
	"study_days_per_week" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learner_goals_target_score_check" CHECK ("learner_goals"."target_score" is null or ("learner_goals"."target_score" between 10 and 990 and "learner_goals"."target_score" % 5 = 0)),
	CONSTRAINT "learner_goals_daily_minutes_check" CHECK ("learner_goals"."daily_study_minutes" is null or "learner_goals"."daily_study_minutes" in (10, 20, 30, 45, 60)),
	CONSTRAINT "learner_goals_study_days_check" CHECK ("learner_goals"."study_days_per_week" is null or "learner_goals"."study_days_per_week" in (3, 5, 7))
);
--> statement-breakpoint
ALTER TABLE "learner_goals" ADD CONSTRAINT "learner_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
