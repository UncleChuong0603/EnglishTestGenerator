import { PLAN_CAPABILITIES, PLAN_CATALOG, type EntitlementKey, type PlanKey } from "@/lib/entitlements/catalog";

export type PublicFeature = { key: "listeningReading" | "recommendations" | "mistakeBank" | "progress" | "fullMock"; free: string; premium: string };

export function publicPlanFeatures(locale: "vi" | "en"): PublicFeature[] {
  const vi = locale === "vi";
  const quota = (plan: PlanKey, key: EntitlementKey) => {
    const value = PLAN_CATALOG[plan].entitlements[key];
    if (value.type === "UNLIMITED") return vi ? "Không giới hạn" : "Unlimited";
    const period = value.period === "DAY" ? (vi ? "ngày" : "day") : (vi ? "tháng" : "month");
    return `${value.count}/${period}`;
  };
  return [
    { key: "listeningReading", free: vi ? "Có" : "Included", premium: vi ? "Có" : "Included" },
    { key: "recommendations", free: quota("FREE", "TODAYS_WORKOUT"), premium: quota("PREMIUM", "TODAYS_WORKOUT") },
    { key: "mistakeBank", free: quota("FREE", "MASTERY_REVIEW"), premium: quota("PREMIUM", "MASTERY_REVIEW") },
    { key: "progress", free: `${PLAN_CAPABILITIES.FREE.historyWindowDays} ${vi ? "ngày" : "days"}`, premium: `${PLAN_CAPABILITIES.PREMIUM.historyWindowDays} ${vi ? "ngày + phân tích sâu" : "days + deeper breakdowns"}` },
    { key: "fullMock", free: quota("FREE", "FULL_MOCK"), premium: quota("PREMIUM", "FULL_MOCK") },
  ];
}

export const PUBLIC_ACTIVATION_HREF = "/try";
