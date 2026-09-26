CREATE TABLE "lifecycle_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"window_key" text NOT NULL,
	"status" text NOT NULL,
	"reason" text,
	"claimed_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"returned_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lifecycle_emails_window_unique" UNIQUE("user_id","type","window_key"),
	CONSTRAINT "lifecycle_emails_status_check" CHECK ("lifecycle_emails"."status" in ('claimed','sent','failed','suppressed'))
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "learning_email_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lifecycle_emails" ADD CONSTRAINT "lifecycle_emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lifecycle_emails_user_sent_idx" ON "lifecycle_emails" USING btree ("user_id","sent_at");