import "server-only";
import { cache } from "react";
import { getEffectivePlan, getMembershipState } from "@/lib/entitlements/service";
import { getCurrentProfile } from "@/lib/profiles/profile";
import { getPremiumLifecycle, type PremiumLifecycle } from "./lifecycle";
import { getActiveTrial } from "./trial";

export type PremiumAccount = { name: string; avatarUrl: string | null; isPremium: boolean; isTrial: boolean; membershipStatus: "ACTIVE" | "EXPIRED" | "REVOKED" | "FREE"; lifecycle: PremiumLifecycle; expiresAt: Date | null; daysRemaining: number | null };

export const getPremiumAccount = cache(async (userId: string, fallbackName: string): Promise<PremiumAccount> => {
  const now = new Date();
  const [profile, plan, membership, trial] = await Promise.all([getCurrentProfile(userId), getEffectivePlan(userId, now), getMembershipState(userId, now), getActiveTrial(userId, now)]);
  const isTrial = Boolean(trial && membership.status === "ACTIVE" && membership.expiresAt?.getTime() === trial.endsAt?.getTime());
  return { name: profile.profile?.full_name ?? fallbackName, avatarUrl: profile.profile?.avatar_url ?? null, isPremium: plan === "PREMIUM", isTrial, membershipStatus: membership.status, lifecycle: getPremiumLifecycle(membership), expiresAt: membership.expiresAt, daysRemaining: membership.daysRemaining };
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
