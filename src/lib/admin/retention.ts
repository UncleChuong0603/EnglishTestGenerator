import { PRODUCT_TIME_ZONE } from "@/lib/entitlements/catalog";
import { productDayStart } from "@/lib/progress/trends";

export const ADMIN_RETENTION_DEFINITIONS = {
  ACTIVATED: "Completed at least one authenticated meaningful learning session.",
  LEARNING_DAY: "A product day with at least one submitted normal practice, recommended workout, or mastery review session.",
  RETURNED_2_DAYS_7D: "At least two distinct meaningful learning days in the latest seven product days.",
  RETURNED_3_DAYS_7D: "At least three distinct meaningful learning days in the latest seven product days.",
  NO_MEANINGFUL_LEARNING: "Registered without any completed meaningful learning session.",
} as const;

export const ADMIN_RETENTION_TIME_ZONE = PRODUCT_TIME_ZONE;
export const EXCLUDED_LEARNING_SOURCES = ["diagnostic", "full_mock", "ranked_challenge"] as const;

export function retentionWindow(now = new Date()) {
  const end = new Date(productDayStart(now).getTime() + 86_400_000);
  return { start: new Date(end.getTime() - 7 * 86_400_000), end };
}

export type LearnerRetentionState = "NO_LEARNING" | "ONE_DAY" | "RETURNING" | "ACTIVE";

export function retentionState(learningDays: number, lastLearning: Date | null, now = new Date()): LearnerRetentionState {
  if (!lastLearning || learningDays === 0) return "NO_LEARNING";
  if (learningDays === 1) return "ONE_DAY";
  return now.getTime() - lastLearning.getTime() <= 3 * 86_400_000 ? "ACTIVE" : "RETURNING";
}

export const USER_ACTIVITY_CATEGORIES = ["ACCOUNT", "GOAL", "DIAGNOSTIC", "PRACTICE", "WORKOUT", "REVIEW", "MOCK", "PREMIUM", "PRODUCT"] as const;
export type UserActivityCategory = (typeof USER_ACTIVITY_CATEGORIES)[number];

export type UserActivityItem = {
  id: string;
  occurredAt: Date;
  category: UserActivityCategory;
  action: string;
  source: string;
  summary: string | null;
  metadata: Record<string, string | number | boolean | null>;
};

export function sortAndLimitTimeline(items: UserActivityItem[], limit = 100) {
  return [...items].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime() || a.id.localeCompare(b.id)).slice(0, Math.max(1, Math.min(limit, 100)));
}
