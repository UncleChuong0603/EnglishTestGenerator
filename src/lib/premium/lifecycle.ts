import type { MembershipState } from "@/lib/entitlements/service";

export const PREMIUM_EXPIRY_POLICY = {
  soonDays: 14,
  verySoonDays: 3,
} as const;

export type PremiumLifecycle = "FREE" | "ACTIVE_NORMAL" | "ACTIVE_EXPIRING_SOON" | "ACTIVE_EXPIRING_VERY_SOON" | "EXPIRED";

export function getPremiumLifecycle(state: MembershipState): PremiumLifecycle {
  if (state.status === "FREE") return "FREE";
  if (state.status === "EXPIRED") return "EXPIRED";
  if (state.daysRemaining !== null && state.daysRemaining <= PREMIUM_EXPIRY_POLICY.verySoonDays) return "ACTIVE_EXPIRING_VERY_SOON";
  if (state.daysRemaining !== null && state.daysRemaining <= PREMIUM_EXPIRY_POLICY.soonDays) return "ACTIVE_EXPIRING_SOON";
  return "ACTIVE_NORMAL";
}

export function quoteResultingExpiry(state: MembershipState, durationDays: number, now: Date) {
  const base = state.status === "ACTIVE" && state.expiresAt && state.expiresAt > now ? state.expiresAt : now;
  return new Date(base.getTime() + durationDays * 86_400_000);
}

