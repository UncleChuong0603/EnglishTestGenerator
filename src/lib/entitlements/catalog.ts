export const PRODUCT_TIME_ZONE = "Asia/Ho_Chi_Minh" as const;

export type PlanKey = "FREE" | "PREMIUM";
export type EntitlementKey = "TODAYS_WORKOUT" | "MANUAL_PRACTICE" | "MASTERY_REVIEW" | "FULL_MOCK";
export type UsagePeriod = "DAY" | "MONTH";
export type EntitlementLimit = { type: "UNLIMITED" } | { type: "LIMITED"; count: number; period: UsagePeriod };

const unlimited = { type: "UNLIMITED" } as const;
export const PLAN_CATALOG: Record<PlanKey, { key: PlanKey; entitlements: Record<EntitlementKey, EntitlementLimit> }> = {
  FREE: { key: "FREE", entitlements: {
    TODAYS_WORKOUT: { type: "LIMITED", count: 1, period: "DAY" },
    MANUAL_PRACTICE: { type: "LIMITED", count: 3, period: "DAY" },
    MASTERY_REVIEW: { type: "LIMITED", count: 1, period: "DAY" },
    FULL_MOCK: { type: "LIMITED", count: 1, period: "MONTH" },
  } },
  PREMIUM: { key: "PREMIUM", entitlements: { TODAYS_WORKOUT: unlimited, MANUAL_PRACTICE: unlimited, MASTERY_REVIEW: unlimited, FULL_MOCK: unlimited } },
};

export type UsageWindow = { start: Date; resetAt: Date };
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
function vietnamParts(now: Date) { const shifted = new Date(now.getTime() + VN_OFFSET_MS); return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth(), day: shifted.getUTCDate() }; }
export function getDailyUsageWindow(now: Date): UsageWindow { const p = vietnamParts(now); const start = new Date(Date.UTC(p.year, p.month, p.day) - VN_OFFSET_MS); return { start, resetAt: new Date(start.getTime() + 86_400_000) }; }
export function getMonthlyUsageWindow(now: Date): UsageWindow { const p = vietnamParts(now); return { start: new Date(Date.UTC(p.year, p.month, 1) - VN_OFFSET_MS), resetAt: new Date(Date.UTC(p.year, p.month + 1, 1) - VN_OFFSET_MS) }; }
export function getUsageWindow(period: UsagePeriod, now: Date) { return period === "DAY" ? getDailyUsageWindow(now) : getMonthlyUsageWindow(now); }
