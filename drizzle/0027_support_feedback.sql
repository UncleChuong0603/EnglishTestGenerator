CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"page_url" text,
	"status" text DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "support_tickets_category_check" CHECK ("support_tickets"."category" in ('TECHNICAL','CONTENT','PAYMENT','SUGGESTION','OTHER')),
	CONSTRAINT "support_tickets_status_check" CHECK ("support_tickets"."status" in ('NEW','IN_PROGRESS','RESOLVED'))
);
--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "support_tickets_status_created_idx" ON "support_tickets" USING btree ("status","created_at");
--> statement-breakpoint
CREATE INDEX "support_tickets_user_created_idx" ON "support_tickets" USING btree ("user_id","created_at");
