import { desc, eq } from "drizzle-orm";
import { db, pool } from "../src/db";
import { users, userPlanMemberships } from "../src/db/schema";
import { grantPremiumByOperator, revokePremiumByOperator } from "../src/lib/admin/service";
import { getEffectivePlan, getUsageStatus } from "../src/lib/entitlements/service";
import { normalizeEmail } from "../src/lib/auth/crypto";

function option(name: string) { const index = process.argv.indexOf(`--${name}`); return index >= 0 ? process.argv[index + 1] : undefined; }
async function main() {
  const command = process.argv[2]; const rawEmail = option("email");
  if (!rawEmail || !["inspect", "grant", "revoke"].includes(command)) throw new Error("USAGE: plan:<inspect|grant|revoke> -- --email user@example.com [--plan PREMIUM --days 30]");
  const email = normalizeEmail(rawEmail); const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.emailNormalized, email)).limit(1); if (!user) throw new Error("USER_NOT_FOUND");
  if (command === "grant") { const days = Number(option("days")); if (option("plan") !== "PREMIUM") throw new Error("INVALID_PLAN"); await grantPremiumByOperator(user.id, days); console.log(`Premium granted for ${days} day(s) to ${user.email}. Existing later expiry was not shortened.`); }
  else if (command === "revoke") { const count = await revokePremiumByOperator(user.id); console.log(`${count} active Premium grant(s) revoked for ${user.email}.`); }
  else { const [plan, usage, grants] = await Promise.all([getEffectivePlan(user.id), getUsageStatus(user.id), db.select({ startsAt: userPlanMemberships.startsAt, endsAt: userPlanMemberships.endsAt, revokedAt: userPlanMemberships.revokedAt }).from(userPlanMemberships).where(eq(userPlanMemberships.userId, user.id)).orderBy(desc(userPlanMemberships.createdAt))]); console.log(JSON.stringify({ email: user.email, effectivePlan: plan, premiumGrants: grants, usage: usage.entitlements }, null, 2)); }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "FAILED"); process.exitCode = 1; }).finally(() => pool.end());
