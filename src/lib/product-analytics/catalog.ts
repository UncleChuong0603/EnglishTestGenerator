import { z } from "zod";

export const PRODUCT_EVENT_NAMES = [
  "landing_viewed", "try_viewed", "guest_practice_started", "guest_practice_completed",
  "diagnostic_started", "diagnostic_completed", "signup_started", "signup_completed", "login_completed",
  "first_authenticated_practice_started", "first_authenticated_practice_completed", "first_workout_completed", "first_mistake_review_completed",
  "practice_started", "practice_completed", "workout_started", "workout_completed", "mistake_review_started", "mistake_review_completed",
  "smart_review_started", "smart_review_completed", "diagnostic_reassessment_started", "diagnostic_reassessment_completed",
  "mock_started", "mock_completed", "pricing_viewed", "checkout_started", "checkout_created", "premium_activated", "premium_renewed",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];
export const browserEventSchema = z.object({
  eventName: z.enum(["landing_viewed", "try_viewed", "pricing_viewed", "signup_started"]),
  route: z.enum(["/", "/try", "/pricing", "/sign-up"]),
  deduplicationKey: z.string().min(8).max(160).regex(/^[a-zA-Z0-9:_-]+$/),
}).strict();

export const safePropertiesSchema = z.record(z.string().max(40), z.union([z.string().max(120), z.number().finite(), z.boolean(), z.null()])).refine(value => Object.keys(value).length <= 8, "Too many properties");
