import { and, eq, gt, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { usageConsumptions, userPlanMemberships } from "@/db/schema";
import { getUsageWindow, PLAN_CATALOG, type EntitlementKey, type PlanKey } from "./catalog";

export async function getEffectivePlan(userId: string, now = new Date()): Promise<PlanKey> {
  const row = await db.select({ id: userPlanMemberships.id }).from(userPlanMemberships).where(and(
    eq(userPlanMemberships.userId, userId), eq(userPlanMemberships.planKey, "PREMIUM"), isNull(userPlanMemberships.revokedAt),
    lte(userPlanMemberships.startsAt, now), or(isNull(userPlanMemberships.endsAt), gt(userPlanMemberships.endsAt, now)),
  )).orderBy(sql`${userPlanMemberships.endsAt} desc nulls first`, sql`${userPlanMemberships.createdAt} desc`).limit(1);
  return row.length ? "PREMIUM" : "FREE";
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
export class UsageLimitError extends Error { readonly code = "USAGE_LIMIT_REACHED"; constructor(readonly status: { entitlement: EntitlementKey; used: number; limit: number; remaining: 0; resetAt: string; effectivePlan: PlanKey }) { super("USAGE_LIMIT_REACHED"); } }

export async function consumeUsage(tx: Tx, input: { userId: string; entitlement: EntitlementKey; sourceType: "PRACTICE_SESSION" | "FULL_MOCK_RUN"; sourceId: string; now: Date }) {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${input.userId}:entitlements`}, 0))`);
  const active = await tx.select({ id: userPlanMemberships.id }).from(userPlanMemberships).where(and(eq(userPlanMemberships.userId, input.userId), isNull(userPlanMemberships.revokedAt), lte(userPlanMemberships.startsAt, input.now), or(isNull(userPlanMemberships.endsAt), gt(userPlanMemberships.endsAt, input.now)))).limit(1);
  if (active.length) return;
  const limit = PLAN_CATALOG.FREE.entitlements[input.entitlement];
  if (limit.type !== "LIMITED") return;
  const window = getUsageWindow(limit.period, input.now);
  const [count] = await tx.select({ used: sql<number>`coalesce(sum(${usageConsumptions.quantity}), 0)::int` }).from(usageConsumptions).where(and(eq(usageConsumptions.userId, input.userId), eq(usageConsumptions.entitlementKey, input.entitlement), sql`${usageConsumptions.createdAt} >= ${window.start}`, sql`${usageConsumptions.createdAt} < ${window.resetAt}`));
  const used = Number(count?.used ?? 0);
  if (used >= limit.count) throw new UsageLimitError({ entitlement: input.entitlement, used, limit: limit.count, remaining: 0, resetAt: window.resetAt.toISOString(), effectivePlan: "FREE" });
  await tx.insert(usageConsumptions).values({ userId: input.userId, entitlementKey: input.entitlement, sourceType: input.sourceType, sourceId: input.sourceId, createdAt: input.now }).onConflictDoNothing();
}
