CREATE TABLE "user_plan_memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "plan_key" text NOT NULL,
  "source" text NOT NULL,
  "starts_at" timestamptz NOT NULL,
  "ends_at" timestamptz,
  "revoked_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "user_plan_memberships_plan_check" CHECK ("plan_key" = 'PREMIUM'),
  CONSTRAINT "user_plan_memberships_source_check" CHECK ("source" IN ('MANUAL','PROMOTION','PAYMENT')),
  CONSTRAINT "user_plan_memberships_range_check" CHECK ("ends_at" IS NULL OR "ends_at" > "starts_at")
);
CREATE INDEX "user_plan_memberships_user_window_idx" ON "user_plan_memberships" ("user_id", "starts_at", "ends_at", "revoked_at");

CREATE TABLE "usage_consumptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "entitlement_key" text NOT NULL,
  "source_type" text NOT NULL,
  "source_id" uuid NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "usage_consumptions_entitlement_check" CHECK ("entitlement_key" IN ('TODAYS_WORKOUT','MANUAL_PRACTICE','MASTERY_REVIEW','FULL_MOCK')),
  CONSTRAINT "usage_consumptions_source_check" CHECK ("source_type" IN ('PRACTICE_SESSION','FULL_MOCK_RUN')),
  CONSTRAINT "usage_consumptions_quantity_check" CHECK ("quantity" > 0),
  CONSTRAINT "usage_consumptions_source_unique" UNIQUE ("user_id", "entitlement_key", "source_type", "source_id")
);
CREATE INDEX "usage_consumptions_user_entitlement_created_idx" ON "usage_consumptions" ("user_id", "entitlement_key", "created_at");
