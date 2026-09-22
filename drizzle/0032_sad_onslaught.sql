CREATE TABLE "learner_contexts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"study_purpose" text,
	"study_purpose_other" text,
	"acquisition_source" text,
	"acquisition_source_other" text,
	"prompt_dismissed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learner_contexts_study_purpose_check" CHECK ("learner_contexts"."study_purpose" is null or "learner_contexts"."study_purpose" in ('GRADUATION_REQUIREMENT','JOB_CAREER','UPCOMING_EXAM','ENGLISH_IMPROVEMENT','OTHER')),
	CONSTRAINT "learner_contexts_acquisition_source_check" CHECK ("learner_contexts"."acquisition_source" is null or "learner_contexts"."acquisition_source" in ('FACEBOOK_GROUP','FACEBOOK_PAGE','THREADS','LINKEDIN','GOOGLE','FRIEND_REFERRAL','OTHER')),
	CONSTRAINT "learner_contexts_study_other_length_check" CHECK ("learner_contexts"."study_purpose_other" is null or char_length("learner_contexts"."study_purpose_other") between 1 and 120),
	CONSTRAINT "learner_contexts_acquisition_other_length_check" CHECK ("learner_contexts"."acquisition_source_other" is null or char_length("learner_contexts"."acquisition_source_other") between 1 and 120),
	CONSTRAINT "learner_contexts_study_other_consistency_check" CHECK ("learner_contexts"."study_purpose" = 'OTHER' or "learner_contexts"."study_purpose_other" is null),
	CONSTRAINT "learner_contexts_acquisition_other_consistency_check" CHECK ("learner_contexts"."acquisition_source" = 'OTHER' or "learner_contexts"."acquisition_source_other" is null)
);
--> statement-breakpoint
ALTER TABLE "learner_contexts" ADD CONSTRAINT "learner_contexts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;