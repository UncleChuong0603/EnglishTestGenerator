CREATE TABLE "mobile_notification_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"todays_workout" boolean DEFAULT true NOT NULL,
	"vocabulary_due" boolean DEFAULT true NOT NULL,
	"unresolved_review" boolean DEFAULT true NOT NULL,
	"weekly_review" boolean DEFAULT true NOT NULL,
	"streak" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mobile_push_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expo_push_token" text NOT NULL,
	"platform" text NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mobile_push_devices_platform_check" CHECK ("platform" in ('android','ios'))
);
--> statement-breakpoint
CREATE TABLE "mobile_push_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_id" uuid,
	"kind" text NOT NULL,
	"local_date" date NOT NULL,
	"expo_ticket_id" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"error_code" text,
	"sent_at" timestamp with time zone,
	"receipt_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mobile_push_deliveries_kind_check" CHECK ("kind" in ('TODAYS_WORKOUT','VOCAB_DUE','UNRESOLVED_REVIEW','WEEKLY_REVIEW')),
	CONSTRAINT "mobile_push_deliveries_status_check" CHECK ("status" in ('PENDING','TICKETED','DELIVERED','FAILED'))
);
--> statement-breakpoint
ALTER TABLE "mobile_notification_preferences" ADD CONSTRAINT "mobile_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "mobile_push_devices" ADD CONSTRAINT "mobile_push_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "mobile_push_deliveries" ADD CONSTRAINT "mobile_push_deliveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "mobile_push_deliveries" ADD CONSTRAINT "mobile_push_deliveries_device_id_mobile_push_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."mobile_push_devices"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "mobile_push_devices_token_uidx" ON "mobile_push_devices" USING btree ("expo_push_token");
--> statement-breakpoint
CREATE INDEX "mobile_push_devices_user_idx" ON "mobile_push_devices" USING btree ("user_id","last_seen_at");
--> statement-breakpoint
ALTER TABLE "mobile_push_deliveries" ADD CONSTRAINT "mobile_push_deliveries_device_kind_date_unique" UNIQUE("device_id","kind","local_date");
--> statement-breakpoint
CREATE INDEX "mobile_push_deliveries_receipt_idx" ON "mobile_push_deliveries" USING btree ("status","sent_at");
