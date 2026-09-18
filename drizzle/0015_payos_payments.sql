CREATE TABLE "payment_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "product_key" text NOT NULL, "provider" text NOT NULL, "order_code" bigint NOT NULL, "provider_payment_id" text,
  "amount" integer NOT NULL, "currency" text DEFAULT 'VND' NOT NULL, "status" text DEFAULT 'PENDING' NOT NULL, "checkout_url" text,
  "created_at" timestamptz DEFAULT now() NOT NULL, "expires_at" timestamptz NOT NULL, "paid_at" timestamptz, "cancelled_at" timestamptz,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "payment_orders_product_check" CHECK ("product_key" in ('PREMIUM_30_DAYS','PREMIUM_90_DAYS','PREMIUM_365_DAYS')),
  CONSTRAINT "payment_orders_provider_check" CHECK ("provider" in ('PAYOS','FAKE')), CONSTRAINT "payment_orders_currency_check" CHECK ("currency" = 'VND'),
  CONSTRAINT "payment_orders_status_check" CHECK ("status" in ('PENDING','PAID','EXPIRED','CANCELLED','FAILED')), CONSTRAINT "payment_orders_amount_check" CHECK ("amount" > 0)
);
CREATE UNIQUE INDEX "payment_orders_order_code_uidx" ON "payment_orders" ("order_code");
CREATE INDEX "payment_orders_user_created_idx" ON "payment_orders" ("user_id","created_at");
CREATE INDEX "payment_orders_provider_reference_idx" ON "payment_orders" ("provider","provider_payment_id");
CREATE INDEX "payment_orders_status_expires_idx" ON "payment_orders" ("status","expires_at");
CREATE INDEX "payment_orders_admin_recent_idx" ON "payment_orders" ("created_at","status");
CREATE TABLE "payment_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "provider" text NOT NULL, "provider_event_key" text NOT NULL,
  "order_id" uuid REFERENCES "payment_orders"("id") ON DELETE restrict, "event_type" text NOT NULL, "processing_status" text DEFAULT 'RECEIVED' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL, "received_at" timestamptz DEFAULT now() NOT NULL, "processed_at" timestamptz,
  CONSTRAINT "payment_events_provider_key_unique" UNIQUE("provider","provider_event_key"), CONSTRAINT "payment_events_provider_check" CHECK ("provider" in ('PAYOS','FAKE')),
  CONSTRAINT "payment_events_processing_check" CHECK ("processing_status" in ('RECEIVED','PROCESSED','REJECTED','FAILED'))
);
CREATE INDEX "payment_events_order_idx" ON "payment_events" ("order_id","received_at");
ALTER TABLE "user_plan_memberships" ADD COLUMN "payment_order_id" uuid REFERENCES "payment_orders"("id") ON DELETE restrict;
CREATE UNIQUE INDEX "user_plan_memberships_payment_order_uidx" ON "user_plan_memberships" ("payment_order_id") WHERE "payment_order_id" IS NOT NULL;
ALTER TABLE "user_plan_memberships" ADD CONSTRAINT "user_plan_memberships_payment_source_check" CHECK (("source" = 'PAYMENT') = ("payment_order_id" is not null));
