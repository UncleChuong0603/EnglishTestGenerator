CREATE TABLE "product_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid,
	"guest_reference" text,
	"session_id" uuid,
	"source" text DEFAULT 'server' NOT NULL,
	"route" text,
	"deduplication_key" text,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_events_actor_check" CHECK (num_nonnulls("product_events"."user_id", "product_events"."guest_reference") <= 1),
	CONSTRAINT "product_events_name_check" CHECK ("product_events"."event_name" in ('landing_viewed','try_viewed','guest_practice_started','guest_practice_completed','diagnostic_started','diagnostic_completed','signup_started','signup_completed','login_completed','first_authenticated_practice_started','first_authenticated_practice_completed','first_workout_completed','first_mistake_review_completed','practice_started','practice_completed','workout_started','workout_completed','mistake_review_started','mistake_review_completed','smart_review_started','smart_review_completed','diagnostic_reassessment_started','diagnostic_reassessment_completed','mock_started','mock_completed','pricing_viewed','checkout_started','checkout_created','premium_activated','premium_renewed')),
	CONSTRAINT "product_events_source_check" CHECK ("product_events"."source" in ('browser','server','payment'))
);
--> statement-breakpoint
ALTER TABLE "product_events" ADD CONSTRAINT "product_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "product_events_name_occurred_idx" ON "product_events" USING btree ("event_name","occurred_at");
--> statement-breakpoint
CREATE INDEX "product_events_occurred_idx" ON "product_events" USING btree ("occurred_at");
--> statement-breakpoint
CREATE INDEX "product_events_user_occurred_idx" ON "product_events" USING btree ("user_id","occurred_at");
--> statement-breakpoint
CREATE INDEX "product_events_guest_occurred_idx" ON "product_events" USING btree ("guest_reference","occurred_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "product_events_dedup_uidx" ON "product_events" USING btree ("deduplication_key") WHERE "product_events"."deduplication_key" is not null;
