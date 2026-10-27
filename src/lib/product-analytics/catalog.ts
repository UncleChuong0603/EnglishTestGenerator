import { z } from "zod";

export const PRODUCT_EVENT_NAMES = [
  "landing_viewed", "try_viewed", "guest_practice_started", "guest_practice_completed",
  "seo_practice_viewed", "seo_practice_started", "seo_practice_completed", "seo_practice_signup_clicked",
  "diagnostic_started", "diagnostic_completed", "signup_started", "signup_completed", "login_completed",
  "first_authenticated_practice_started", "first_authenticated_practice_completed", "first_workout_completed", "first_mistake_review_completed",
  "practice_started", "practice_completed", "workout_started", "workout_completed", "mistake_review_started", "mistake_review_completed",
  "smart_review_started", "smart_review_completed", "diagnostic_reassessment_started", "diagnostic_reassessment_completed",
  "mock_started", "mock_completed", "pricing_viewed", "checkout_started", "checkout_created", "premium_activated", "premium_renewed",
  "trial_eligible", "trial_started", "trial_expired", "trial_to_paid",
  "challenge_viewed", "challenge_started", "challenge_completed", "signup_after_challenge", "first_authenticated_workout_after_challenge",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];

export const safePropertiesSchema = z.record(z.string().max(40), z.union([z.string().max(120), z.number().finite(), z.boolean(), z.null()])).refine(value => Object.keys(value).length <= 8, "Too many properties");

export const SEO_PRACTICE_BROWSER_EVENTS = [
  "seo_practice_viewed",
  "seo_practice_started",
  "seo_practice_completed",
  "seo_practice_signup_clicked",
] as const;

const browserEventNames = [
  "landing_viewed",
  "try_viewed",
  "pricing_viewed",
  "signup_started",
  "challenge_viewed",
  ...SEO_PRACTICE_BROWSER_EVENTS,
] as const;

const fixedBrowserRoutes: Partial<Record<(typeof browserEventNames)[number], string>> = {
  landing_viewed: "/",
  try_viewed: "/try",
  pricing_viewed: "/pricing",
  signup_started: "/sign-up",
  challenge_viewed: "/challenge/part-5",
};

export function isSeoPracticeBrowserEvent(eventName: string): eventName is (typeof SEO_PRACTICE_BROWSER_EVENTS)[number] {
  return SEO_PRACTICE_BROWSER_EVENTS.some(name => name === eventName);
}

export const browserEventSchema = z.object({
  eventName: z.enum(browserEventNames),
  route: z.string().min(1).max(160),
  deduplicationKey: z.string().min(8).max(160).regex(/^[a-zA-Z0-9:_-]+$/),
  properties: safePropertiesSchema.optional(),
}).strict().superRefine((value, context) => {
  if (isSeoPracticeBrowserEvent(value.eventName)) {
    if (!/^\/(?:blog|toeic)(?:\/[a-z0-9-]+)*$/.test(value.route)) {
      context.addIssue({ code: "custom", path: ["route"], message: "Invalid SEO practice route" });
    }
    return;
  }
  if (fixedBrowserRoutes[value.eventName] !== value.route) {
    context.addIssue({ code: "custom", path: ["route"], message: "Event does not match route" });
  }
});
