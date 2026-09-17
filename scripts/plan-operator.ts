import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "../src/db";
import { users, userPlanMemberships } from "../src/db/schema";
import { getEffectivePlan, getUsageStatus } from "../src/lib/entitlements/service";

function option(name: string) { const index = process.argv.indexOf(`--${name}`); return index >= 0 ? process.argv[index + 1] : undefined; }
const command = process.argv[2]; const email = option("email")?.trim().toLowerCase();
if (!email || !["inspect", "grant", "revoke"].includes(command)) { console.error("Usage: plan:<inspect|grant|revoke> -- --email user@example.com [--plan PREMIUM --days 30]"); process.exit(2); }
const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.emailNormalized, email)).limit(1);
if (!user) { console.error("User not found."); process.exit(3); }
const now = new Date();
if (command === "grant") {
  const days = Number(option("days")); if (option("plan") !== "PREMIUM" || !Number.isInteger(days) || days < 1 || days > 3650) { console.error("Grant requires --plan PREMIUM and --days between 1 and 3650."); process.exit(2); }
  await db.transaction(async (tx) => { await tx.execute(`select pg_advisory_xact_lock(hashtextextended('${user.id}:plan-operator', 0))`); const [latest] = await tx.select().from(userPlanMemberships).where(and(eq(userPlanMemberships.userId, user.id), isNull(userPlanMemberships.revokedAt), or(isNull(userPlanMemberships.endsAt), gt(userPlanMemberships.endsAt, now)))).orderBy(desc(userPlanMemberships.endsAt)).limit(1); const base = latest?.endsAt && latest.endsAt > now ? latest.endsAt : now; const endsAt = new Date(base.getTime() + days * 86_400_000); await tx.insert(userPlanMemberships).values({ userId: user.id, planKey: "PREMIUM", source: "MANUAL", startsAt: now, endsAt }); });
  console.log(`Premium granted for ${days} day(s) to ${user.email}. Existing later expiry was not shortened.`);
} else if (command === "revoke") {
  await db.update(userPlanMemberships).set({ revokedAt: now, updatedAt: now }).where(and(eq(userPlanMemberships.userId, user.id), isNull(userPlanMemberships.revokedAt), gt(userPlanMemberships.startsAt, new Date(0)), or(isNull(userPlanMemberships.endsAt), gt(userPlanMemberships.endsAt, now))));
  console.log(`Active Premium grants revoked for ${user.email}.`);
} else {
  const [plan, usage, grants] = await Promise.all([getEffectivePlan(user.id, now), getUsageStatus(user.id, now), db.select({ startsAt: userPlanMemberships.startsAt, endsAt: userPlanMemberships.endsAt, revokedAt: userPlanMemberships.revokedAt }).from(userPlanMemberships).where(eq(userPlanMemberships.userId, user.id)).orderBy(desc(userPlanMemberships.createdAt))]);
  console.log(JSON.stringify({ email: user.email, effectivePlan: plan, premiumGrants: grants, usage: usage.entitlements }, null, 2));
}
