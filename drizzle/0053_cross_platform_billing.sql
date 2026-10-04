ALTER TABLE "user_plan_memberships" DROP CONSTRAINT "user_plan_memberships_payment_source_check";
--> statement-breakpoint
ALTER TABLE "user_plan_memberships" DROP CONSTRAINT "user_plan_memberships_source_check";
--> statement-breakpoint
UPDATE "user_plan_memberships" SET "source" = 'PAYOS' WHERE "source" = 'PAYMENT';
--> statement-breakpoint
UPDATE "user_plan_memberships" SET "source" = 'ADMIN' WHERE "source" = 'MANUAL';
--> statement-breakpoint
CREATE TABLE "store_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_reference_hash" text NOT NULL,
	"original_transaction_id" text NOT NULL,
	"latest_transaction_id" text NOT NULL,
	"product_id" text NOT NULL,
	"status" text NOT NULL,
	"environment" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"last_verified_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_purchases_provider_check" CHECK ("provider" in ('APPLE_IAP','GOOGLE_PLAY')),
	CONSTRAINT "store_purchases_status_check" CHECK ("status" in ('ACTIVE','EXPIRED','REFUNDED','REVOKED')),
	CONSTRAINT "store_purchases_environment_check" CHECK ("environment" in ('PRODUCTION','SANDBOX')),
	CONSTRAINT "store_purchases_reference_hash_check" CHECK (length("provider_reference_hash") = 64),
	CONSTRAINT "store_purchases_range_check" CHECK ("expires_at" > "starts_at")
);
--> statement-breakpoint
ALTER TABLE "store_purchases" ADD CONSTRAINT "store_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "store_purchases_provider_reference_uidx" ON "store_purchases" USING btree ("provider","provider_reference_hash");
--> statement-breakpoint
CREATE INDEX "store_purchases_user_status_idx" ON "store_purchases" USING btree ("user_id","status","expires_at");
--> statement-breakpoint
CREATE TABLE "store_purchase_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"provider_event_id" text NOT NULL,
	"purchase_id" uuid,
	"event_type" text NOT NULL,
	"processing_status" text DEFAULT 'RECEIVED' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "store_purchase_events_provider_check" CHECK ("provider" in ('APPLE_IAP','GOOGLE_PLAY')),
	CONSTRAINT "store_purchase_events_type_check" CHECK ("event_type" in ('PURCHASE','RESTORE','RENEWAL','EXPIRATION','REFUND','REVOKE')),
	CONSTRAINT "store_purchase_events_processing_check" CHECK ("processing_status" in ('RECEIVED','PROCESSED','REJECTED','FAILED')),
	CONSTRAINT "store_purchase_events_provider_event_unique" UNIQUE("provider","provider_event_id")
);
--> statement-breakpoint
ALTER TABLE "store_purchase_events" ADD CONSTRAINT "store_purchase_events_purchase_id_store_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."store_purchases"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "store_purchase_events_purchase_idx" ON "store_purchase_events" USING btree ("purchase_id","received_at");
--> statement-breakpoint
ALTER TABLE "user_plan_memberships" ADD COLUMN "store_purchase_id" uuid;
--> statement-breakpoint
ALTER TABLE "user_plan_memberships" ADD COLUMN "source_reference" text;
--> statement-breakpoint
ALTER TABLE "user_plan_memberships" ADD CONSTRAINT "user_plan_memberships_store_purchase_id_store_purchases_id_fk" FOREIGN KEY ("store_purchase_id") REFERENCES "public"."store_purchases"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_plan_memberships" ADD CONSTRAINT "user_plan_memberships_source_check" CHECK ("source" in ('PAYOS','APPLE_IAP','GOOGLE_PLAY','TRIAL','PROMOTION','ADMIN'));
--> statement-breakpoint
ALTER TABLE "user_plan_memberships" ADD CONSTRAINT "user_plan_memberships_payos_source_check" CHECK (("source" = 'PAYOS') = ("payment_order_id" is not null));
--> statement-breakpoint
ALTER TABLE "user_plan_memberships" ADD CONSTRAINT "user_plan_memberships_store_source_check" CHECK (("source" in ('APPLE_IAP','GOOGLE_PLAY')) = ("store_purchase_id" is not null));
--> statement-breakpoint
CREATE UNIQUE INDEX "user_plan_memberships_source_reference_uidx" ON "user_plan_memberships" USING btree ("source","source_reference") WHERE "source_reference" is not null;
