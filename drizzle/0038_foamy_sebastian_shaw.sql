CREATE TABLE "weekly_plan_snapshots" (
	"user_id" uuid NOT NULL,
	"week_start" date NOT NULL,
	"signature" text NOT NULL,
	"items" jsonb NOT NULL,
	"adjustment_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_plan_snapshots_user_id_week_start_pk" PRIMARY KEY("user_id","week_start")
);
--> statement-breakpoint
ALTER TABLE "weekly_plan_snapshots" ADD CONSTRAINT "weekly_plan_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;