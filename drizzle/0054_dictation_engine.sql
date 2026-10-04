CREATE TABLE "dictation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"source_ref" text NOT NULL,
	"content_fingerprint" text NOT NULL,
	"status" text DEFAULT 'IN_PROGRESS' NOT NULL,
	"attempts_count" integer DEFAULT 0 NOT NULL,
	"best_accuracy" integer DEFAULT 0 NOT NULL,
	"hint_used" boolean DEFAULT false NOT NULL,
	"transcript_revealed_at" timestamp with time zone,
	"mastered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dictation_sessions_source_check" CHECK ("source_type" in ('TALK')),
	CONSTRAINT "dictation_sessions_status_check" CHECK ("status" in ('IN_PROGRESS','MASTERED')),
	CONSTRAINT "dictation_sessions_accuracy_check" CHECK ("best_accuracy" between 0 and 100),
	CONSTRAINT "dictation_sessions_attempts_check" CHECK ("attempts_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "dictation_sessions" ADD CONSTRAINT "dictation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "dictation_sessions_user_created_idx" ON "dictation_sessions" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX "dictation_sessions_user_status_idx" ON "dictation_sessions" USING btree ("user_id","status","updated_at");
--> statement-breakpoint
CREATE TABLE "dictation_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"accuracy" integer NOT NULL,
	"exact" boolean NOT NULL,
	"used_hint" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dictation_attempts_session_number_unique" UNIQUE("session_id","attempt_number"),
	CONSTRAINT "dictation_attempts_number_check" CHECK ("attempt_number" > 0),
	CONSTRAINT "dictation_attempts_accuracy_check" CHECK ("accuracy" between 0 and 100)
);
--> statement-breakpoint
ALTER TABLE "dictation_attempts" ADD CONSTRAINT "dictation_attempts_session_id_dictation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."dictation_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dictation_attempts" ADD CONSTRAINT "dictation_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "dictation_attempts_user_created_idx" ON "dictation_attempts" USING btree ("user_id","created_at");
