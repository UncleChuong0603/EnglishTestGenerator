import "server-only";
import { and, eq, gt, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { productEvents, userPlanMemberships } from "@/db/schema";
import { recordProductEvent } from "@/lib/product-analytics/service";
import { hasMeaningfulLearning, trialEndsAt } from "./trial-policy";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type TrialEligibility = { eligible: boolean; learningDays: number; answeredQuestions: number; reason: "ELIGIBLE" | "ACCOUNT" | "PREMIUM" | "PREVIOUS_TRIAL" | "PENDING_PAYMENT" | "INSUFFICIENT_DATA" };

function eligibilityQuery(userId: string, now: Date) {
  return sql`
    select
      exists(select 1 from users u where u.id=${userId} and u.status='active' and u.email_verified_at is not null
        and not exists(select 1 from user_roles r where r.user_id=u.id and r.role='ADMIN' and r.revoked_at is null)) as account_ok,
      exists(select 1 from user_plan_memberships m where m.user_id=${userId} and m.source='TRIAL') as previous_trial,
      exists(select 1 from user_plan_memberships m where m.user_id=${userId} and m.plan_key='PREMIUM'
        and m.revoked_at is null and (m.ends_at is null or m.ends_at>${now})) as premium,
      exists(select 1 from payment_orders p where p.user_id=${userId} and p.status='PENDING' and p.expires_at>${now}) as pending_payment,
      (select count(distinct timezone('Asia/Ho_Chi_Minh', ps.submitted_at)::date)::int
        from practice_sessions ps where ps.user_id=${userId} and ps.status='submitted'
        and ps.source not in ('diagnostic','full_mock','ranked_challenge') and ps.practice_type<>'demo_test'
        and exists(select 1 from attempt_answers aa where aa.session_id=ps.id and aa.user_id=${userId} and aa.answered_at is not null)) as learning_days,
      (select count(distinct aa.question_id)::int from attempt_answers aa join practice_sessions ps on ps.id=aa.session_id
        where ps.user_id=${userId} and aa.user_id=${userId} and aa.answered_at is not null and ps.status='submitted'
        and ps.source not in ('diagnostic','full_mock','ranked_challenge') and ps.practice_type<>'demo_test') as answered_questions`;
}

function eligibilityFrom(row: Record<string, unknown>): TrialEligibility {
  const learningDays = Number(row.learning_days ?? 0);
  const answeredQuestions = Number(row.answered_questions ?? 0);
  const reason = !row.account_ok ? "ACCOUNT" : row.previous_trial ? "PREVIOUS_TRIAL" : row.premium ? "PREMIUM" : row.pending_payment ? "PENDING_PAYMENT" : !hasMeaningfulLearning(learningDays, answeredQuestions) ? "INSUFFICIENT_DATA" : "ELIGIBLE";
  return { eligible: reason === "ELIGIBLE", learningDays, answeredQuestions, reason };
}

export async function getTrialEligibility(userId: string, now = new Date()): Promise<TrialEligibility> {
  const result = await db.execute(eligibilityQuery(userId, now));
  const eligibility = eligibilityFrom(result.rows[0] as Record<string, unknown>);
  if (eligibility.eligible) await recordProductEvent({ userId, eventName: "trial_eligible", deduplicationKey: `trial-eligible:${userId}`, properties: { learningDays: eligibility.learningDays, answeredQuestions: eligibility.answeredQuestions } });
  return eligibility;
}

export async function activateTrial(userId: string) {
  return db.transaction(async (tx: Tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:plan`}, 0))`);
    const [previous] = await tx.select({ id: userPlanMemberships.id, startsAt: userPlanMemberships.startsAt, endsAt: userPlanMemberships.endsAt })
      .from(userPlanMemberships).where(and(eq(userPlanMemberships.userId, userId), eq(userPlanMemberships.source, "TRIAL"))).limit(1);
    const now = new Date();
    if (previous) return { status: previous.endsAt && previous.endsAt > now ? "ALREADY_STARTED" as const : "ALREADY_USED" as const, endsAt: previous.endsAt };
    const result = await tx.execute(eligibilityQuery(userId, now));
    const eligibility = eligibilityFrom(result.rows[0] as Record<string, unknown>);
    if (!eligibility.eligible) return { status: "INELIGIBLE" as const, reason: eligibility.reason, endsAt: null };
    const endsAt = trialEndsAt(now);
    const [trial] = await tx.insert(userPlanMemberships).values({ userId, planKey: "PREMIUM", source: "TRIAL", startsAt: now, endsAt }).returning({ id: userPlanMemberships.id });
    await tx.insert(productEvents).values({ userId, eventName: "trial_started", source: "server", deduplicationKey: `trial-started:${userId}`, properties: { membershipId: trial.id } }).onConflictDoNothing();
    return { status: "STARTED" as const, endsAt };
  });
}

export async function getActiveTrial(userId: string, now = new Date()) {
  const [trial] = await db.select({ id: userPlanMemberships.id, startsAt: userPlanMemberships.startsAt, endsAt: userPlanMemberships.endsAt })
    .from(userPlanMemberships).where(and(eq(userPlanMemberships.userId, userId), eq(userPlanMemberships.source, "TRIAL"), isNull(userPlanMemberships.revokedAt), lte(userPlanMemberships.startsAt, now), gt(userPlanMemberships.endsAt, now))).limit(1);
  return trial ?? null;
}

export async function recordTrialExpiry(userId: string, now = new Date()) {
  const [trial] = await db.select({ id: userPlanMemberships.id, endsAt: userPlanMemberships.endsAt }).from(userPlanMemberships)
    .where(and(eq(userPlanMemberships.userId, userId), eq(userPlanMemberships.source, "TRIAL"), lte(userPlanMemberships.endsAt, now))).limit(1);
  if (trial?.endsAt) try {
    await db.insert(productEvents).values({ userId, eventName: "trial_expired", source: "server", occurredAt: trial.endsAt, deduplicationKey: `trial-expired:${userId}`, properties: { membershipId: trial.id } }).onConflictDoNothing();
  } catch (error) {
    console.error("[trial] expiry event insert failed", error instanceof Error ? error.message : "unknown");
  }
}
