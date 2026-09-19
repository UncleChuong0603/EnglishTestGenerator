import "server-only";
import { cache } from "react";
import { getEffectivePlan } from "@/lib/entitlements/service";
import { getPremiumExpiry } from "@/lib/payments/service";
import { getCurrentProfile } from "@/lib/profiles/profile";

export type PremiumAccount = { name: string; avatarUrl: string | null; isPremium: boolean; expiresAt: Date | null };

export const getPremiumAccount = cache(async (userId: string, fallbackName: string): Promise<PremiumAccount> => {
  const [profile, plan, expiresAt] = await Promise.all([getCurrentProfile(userId), getEffectivePlan(userId), getPremiumExpiry(userId)]);
  return { name: profile.profile?.full_name ?? fallbackName, avatarUrl: profile.profile?.avatar_url ?? null, isPremium: plan === "PREMIUM", expiresAt };
});

export function premiumCopy(locale: "vi" | "en") {
  return locale === "vi" ? {
    member: "Thành viên Premium", active: "Premium đang hoạt động", expires: "Hết hạn vào",
    manage: "Quản lý gói", benefits: "Quyền lợi Premium", current: "Bạn đang dùng Premium",
    free: "Gói Free", freeBody: "Bạn đang sử dụng trải nghiệm học tập Free của TOEICGym.", extend: "Gia hạn Premium",
  } : {
    member: "Premium member", active: "Premium active", expires: "Expires on",
    manage: "Manage plan", benefits: "Premium benefits", current: "You’re currently on Premium",
    free: "Free plan", freeBody: "You’re using TOEICGym’s complete Free learning experience.", extend: "Extend Premium",
  };
}
