import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { authRateLimits } from "@/db/schema";
import { hashToken } from "./crypto";

export type RateLimitAction = "signup" | "login" | "forgot_password" | "reset_password" | "resend_verification" | "google_oauth" | "guest_practice" | "product_analytics" | "support_feedback";
const limits: Record<RateLimitAction, { attempts: number; windowMs: number }> = {
  signup: { attempts: 5, windowMs: 3_600_000 }, login: { attempts: 10, windowMs: 900_000 }, forgot_password: { attempts: 5, windowMs: 3_600_000 }, reset_password: { attempts: 8, windowMs: 3_600_000 }, resend_verification: { attempts: 5, windowMs: 3_600_000 }, google_oauth: { attempts: 20, windowMs: 900_000 }, guest_practice: { attempts: 20, windowMs: 900_000 }, product_analytics: { attempts: 60, windowMs: 900_000 }, support_feedback: { attempts: 5, windowMs: 3_600_000 },
};

export async function enforceRateLimit(action: RateLimitAction, identifier: string) {
  const config = limits[action]; const keyHash = hashToken(`${action}:${identifier.toLowerCase()}`);
  const result = await db.execute(sql<{ attempts: number; blocked_until: Date | null }>`
    insert into ${authRateLimits} (key_hash, action, window_started_at, attempts, updated_at)
    values (${keyHash}, ${action}, now(), 1, now())
    on conflict (key_hash) do update set
      attempts = case when ${authRateLimits.windowStartedAt} < now() - (${config.windowMs} * interval '1 millisecond') then 1 else ${authRateLimits.attempts} + 1 end,
      window_started_at = case when ${authRateLimits.windowStartedAt} < now() - (${config.windowMs} * interval '1 millisecond') then now() else ${authRateLimits.windowStartedAt} end,
      blocked_until = case
        when ${authRateLimits.windowStartedAt} < now() - (${config.windowMs} * interval '1 millisecond') then null
        when ${authRateLimits.attempts} + 1 > ${config.attempts} then coalesce(${authRateLimits.blockedUntil}, ${authRateLimits.windowStartedAt} + (${config.windowMs} * interval '1 millisecond'))
        else ${authRateLimits.blockedUntil}
      end,
      updated_at = now()
    returning attempts, blocked_until`);
  const row = result.rows[0];
  if (row && (Number(row.attempts) > config.attempts || row.blocked_until && new Date(row.blocked_until as Date) > new Date())) throw new Error("RATE_LIMITED");
}
