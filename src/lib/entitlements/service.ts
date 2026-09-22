import { and, desc, eq, gt, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { usageConsumptions, userPlanMemberships } from "@/db/schema";
import { getPlanCapabilities, getUsageWindow, PLAN_CATALOG, type EntitlementKey, type PlanKey } from "./catalog";
import { quoteResultingExpiry } from "@/lib/premium/lifecycle";

function activePremiumMembership(userId: string, now: Date) {
  return and(
    eq(userPlanMemberships.userId, userId),
    eq(userPlanMemberships.planKey, "PREMIUM"),
    isNull(userPlanMemberships.revokedAt),
    lte(userPlanMemberships.startsAt, now),
    or(isNull(userPlanMemberships.endsAt), gt(userPlanMemberships.endsAt, now)),
  );
}

export async function getEffectivePlan(userId: string, now = new Date()): Promise<PlanKey> {
  const row = await db.select({ id: userPlanMemberships.id }).from(userPlanMemberships).where(activePremiumMembership(userId, now)).orderBy(sql`${userPlanMemberships.endsAt} desc nulls first`, sql`${userPlanMemberships.createdAt} desc`).limit(1);
  return row.length ? "PREMIUM" : "FREE";
}

export async function getEffectiveCapabilities(userId: string, now = new Date()) {
  const plan = await getEffectivePlan(userId, now);
  return { plan, ...getPlanCapabilities(plan) };
}

export type MembershipState = { status: "ACTIVE" | "EXPIRED" | "FREE"; expiresAt: Date | null; daysRemaining: number | null };
export async function getMembershipState(userId: string, now = new Date()): Promise<MembershipState> {
  const [active] = await db.select({ endsAt: userPlanMemberships.endsAt }).from(userPlanMemberships).where(activePremiumMembership(userId, now)).orderBy(sql`${userPlanMemberships.endsAt} desc nulls first`, desc(userPlanMemberships.createdAt)).limit(1);
  if (active) return { status: "ACTIVE", expiresAt: active.endsAt, daysRemaining: active.endsAt ? Math.max(1, Math.ceil((active.endsAt.getTime() - now.getTime()) / 86_400_000)) : null };
  const [row] = await db.select({ endsAt: userPlanMemberships.endsAt }).from(userPlanMemberships).where(and(eq(userPlanMemberships.userId, userId), eq(userPlanMemberships.planKey, "PREMIUM")))
    .orderBy(sql`${userPlanMemberships.endsAt} desc nulls first`, desc(userPlanMemberships.createdAt)).limit(1);
  if (!row) return { status: "FREE", expiresAt: null, daysRemaining: null };
  return { status: "EXPIRED", expiresAt: row.endsAt, daysRemaining: 0 };
}

export type UsageItem = { type: "UNLIMITED"; used: number; resetAt: null } | { type: "LIMITED"; used: number; limit: number; remaining: number; resetAt: string };
export type UsageStatus = { effectivePlan: PlanKey; entitlements: Record<EntitlementKey, UsageItem> };

export async function getUsageStatus(userId: string, now = new Date()): Promise<UsageStatus> {
  const effectivePlan = await getEffectivePlan(userId, now);
  const daily = getUsageWindow("DAY", now); const monthly = getUsageWindow("MONTH", now);
  const rows = await db.select({ key: usageConsumptions.entitlementKey, quantity: usageConsumptions.quantity, createdAt: usageConsumptions.createdAt }).from(usageConsumptions)
    .where(and(eq(usageConsumptions.userId, userId), sql`${usageConsumptions.createdAt} >= ${monthly.start}`, sql`${usageConsumptions.createdAt} < ${daily.resetAt}`));
  const keys: EntitlementKey[] = ["TODAYS_WORKOUT", "MANUAL_PRACTICE", "MASTERY_REVIEW", "FULL_MOCK"];
  const entitlements = Object.fromEntries(keys.map((key) => { const limit = PLAN_CATALOG[effectivePlan].entitlements[key]; const window = limit.type === "LIMITED" ? getUsageWindow(limit.period, now) : null; const used = rows.filter((row) => row.key === key && (!window || row.createdAt >= window.start)).reduce((sum, row) => sum + row.quantity, 0); return [key, limit.type === "UNLIMITED" ? { type: "UNLIMITED", used, resetAt: null } : { type: "LIMITED", used, limit: limit.count, remaining: Math.max(0, limit.count - used), resetAt: window!.resetAt.toISOString() }]; })) as Record<EntitlementKey, UsageItem>;
  return { effectivePlan, entitlements };
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type EntitlementTx = Tx;

export async function grantPremiumWithTx(tx: Tx, input: { userId: string; days: number; now?: Date; source?: "MANUAL" | "PROMOTION" | "PAYMENT"; paymentOrderId?: string }) {
  const now = input.now ?? new Date();
  if (!Number.isInteger(input.days) || input.days < 1 || input.days > 3650) throw new Error("INVALID_DURATION");
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${input.userId}:plan`}, 0))`);
  const [latest] = await tx.select({ endsAt: userPlanMemberships.endsAt }).from(userPlanMemberships).where(activePremiumMembership(input.userId, now)).orderBy(sql`${userPlanMemberships.endsAt} desc nulls first`).limit(1);
  if (latest?.endsAt === null) return { membershipId: null, endsAt: null, unchanged: true as const };
  const endsAt = quoteResultingExpiry(latest ? { status: "ACTIVE", expiresAt: latest.endsAt, daysRemaining: null } : { status: "FREE", expiresAt: null, daysRemaining: null }, input.days, now);
  const source = input.source ?? "MANUAL";
  if ((source === "PAYMENT") !== Boolean(input.paymentOrderId)) throw new Error("INVALID_MEMBERSHIP_SOURCE");
  const [membership] = await tx.insert(userPlanMemberships).values({ userId: input.userId, planKey: "PREMIUM", source, paymentOrderId: input.paymentOrderId, startsAt: now, endsAt }).returning({ id: userPlanMemberships.id });
  return { membershipId: membership.id, endsAt, unchanged: false as const };
}

export async function revokePremiumWithTx(tx: Tx, input: { userId: string; now?: Date }) {
  const now = input.now ?? new Date();
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${input.userId}:plan`}, 0))`);
  return tx.update(userPlanMemberships).set({ revokedAt: now, updatedAt: now }).where(activePremiumMembership(input.userId, now)).returning({ id: userPlanMemberships.id });
}

export async function getMembershipHistory(userId: string, page = 1, pageSize = 20) {
  return db.select({ id: userPlanMemberships.id, planKey: userPlanMemberships.planKey, source: userPlanMemberships.source, paymentOrderId: userPlanMemberships.paymentOrderId, startsAt: userPlanMemberships.startsAt, endsAt: userPlanMemberships.endsAt, revokedAt: userPlanMemberships.revokedAt, createdAt: userPlanMemberships.createdAt })
    .from(userPlanMemberships).where(eq(userPlanMemberships.userId, userId)).orderBy(desc(userPlanMemberships.createdAt), desc(userPlanMemberships.id)).limit(pageSize).offset((page - 1) * pageSize);
}
export class UsageLimitError extends Error { readonly code = "USAGE_LIMIT_REACHED"; constructor(readonly status: { entitlement: EntitlementKey; used: number; limit: number; remaining: 0; resetAt: string; effectivePlan: PlanKey }) { super("USAGE_LIMIT_REACHED"); } }

export async function consumeUsage(tx: Tx, input: { userId: string; entitlement: EntitlementKey; sourceType: "PRACTICE_SESSION" | "FULL_MOCK_RUN"; sourceId: string; now: Date }) {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${input.userId}:entitlements`}, 0))`);
  const active = await tx.select({ id: userPlanMemberships.id }).from(userPlanMemberships).where(activePremiumMembership(input.userId, input.now)).limit(1);
  if (active.length) return;
  const limit = PLAN_CATALOG.FREE.entitlements[input.entitlement];
  if (limit.type !== "LIMITED") return;
  const window = getUsageWindow(limit.period, input.now);
  const [count] = await tx.select({ used: sql<number>`coalesce(sum(${usageConsumptions.quantity}), 0)::int` }).from(usageConsumptions).where(and(eq(usageConsumptions.userId, input.userId), eq(usageConsumptions.entitlementKey, input.entitlement), sql`${usageConsumptions.createdAt} >= ${window.start}`, sql`${usageConsumptions.createdAt} < ${window.resetAt}`));
  const used = Number(count?.used ?? 0);
  if (used >= limit.count) throw new UsageLimitError({ entitlement: input.entitlement, used, limit: limit.count, remaining: 0, resetAt: window.resetAt.toISOString(), effectivePlan: "FREE" });
  await tx.insert(usageConsumptions).values({ userId: input.userId, entitlementKey: input.entitlement, sourceType: input.sourceType, sourceId: input.sourceId, createdAt: input.now }).onConflictDoNothing();
}
