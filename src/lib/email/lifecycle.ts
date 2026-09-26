import "server-only";
import { and, eq, gte, isNotNull, lt, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { fullMockRuns, learnerGoals, lifecycleEmails, practiceSessions, profiles, questionSolutions, questions, users } from "@/db/schema";
import { createToken, hashToken } from "@/lib/auth/crypto";
import { getUsageStatus } from "@/lib/entitlements/service";
import { productWeekWindow } from "@/lib/weekly-plan/policy";
import { getServerEnv } from "@/lib/env";
import { EmailDeliveryError, sendEngagementEmail } from "./mailer";
import { lifecycleCandidates, lifecycleMessage, type LifecycleCandidate } from "./lifecycle-policy";

const DAY = 86_400_000;
const eligiblePractice = and(eq(practiceSessions.status, "submitted"),
  sql`${practiceSessions.submittedAt} is not null`,
  sql`${practiceSessions.source} not in ('diagnostic','full_mock','ranked_challenge')`,
  ne(practiceSessions.practiceType, "demo_test"),
  sql`exists (select 1 from attempt_answers aa where aa.session_id = ${practiceSessions.id} and aa.user_id = ${practiceSessions.userId} and aa.answered_at is not null)`);

async function learningFacts(userId: string, now: Date) {
  const week = productWeekWindow(now);
  const prior = new Date(week.start.getTime() - 7 * DAY);
  const [practice, mocks] = await Promise.all([
    db.select({ first: sql<Date | null>`min(${practiceSessions.submittedAt})`, last: sql<Date | null>`max(${practiceSessions.submittedAt})`,
      count: sql<number>`count(*)::int`, weekCount: sql<number>`count(*) filter (where ${practiceSessions.submittedAt} >= ${prior} and ${practiceSessions.submittedAt} < ${week.start})::int` })
      .from(practiceSessions).where(and(eq(practiceSessions.userId, userId), eligiblePractice)),
    db.select({ first: sql<Date | null>`min(${fullMockRuns.completedAt})`, last: sql<Date | null>`max(${fullMockRuns.completedAt})`,
      count: sql<number>`count(*)::int`, weekCount: sql<number>`count(*) filter (where ${fullMockRuns.completedAt} >= ${prior} and ${fullMockRuns.completedAt} < ${week.start})::int` })
      .from(fullMockRuns).where(and(eq(fullMockRuns.userId, userId), eq(fullMockRuns.status, "COMPLETED"), eq(fullMockRuns.mode, "LISTENING"),
        sql`exists (select 1 from practice_sessions ps inner join attempt_answers aa on aa.session_id = ps.id and aa.user_id = ps.user_id where ps.full_mock_run_id = ${fullMockRuns.id} and aa.answered_at is not null)`)),
  ]);
  const dates = [practice[0]?.first, practice[0]?.last, mocks[0]?.first, mocks[0]?.last].filter((date): date is Date => date instanceof Date);
  const count = Number(practice[0]?.count ?? 0) + Number(mocks[0]?.count ?? 0);
  return { sessions: dates.length ? [new Date(Math.min(...dates.map(d => d.getTime()))), new Date(Math.max(...dates.map(d => d.getTime())))] : [],
    sessionCount: count, previousWeekSessions: Number(practice[0]?.weekCount ?? 0) + Number(mocks[0]?.weekCount ?? 0) };
}

async function hasAction(userId: string, type: LifecycleCandidate["type"], now: Date) {
  if (type === "weekly_review") return true;
  const [content] = await db.select({ id: questions.id }).from(questions)
    .innerJoin(questionSolutions, eq(questionSolutions.questionId, questions.id))
    .where(and(eq(questions.status, "published"), eq(questions.toeicPart, 5))).limit(1);
  if (!content) return false;
  const usage = await getUsageStatus(userId, now);
  const manual = usage.entitlements.MANUAL_PRACTICE;
  return manual.type === "UNLIMITED" || manual.remaining > 0;
}

type Claim = { id: string; rawToken: string } | { reason: "duplicate" | "frequency" | "opted_out" };
async function claim(userId: string, candidate: LifecycleCandidate, now: Date): Promise<Claim> {
  return db.transaction(async tx => {
    const [account] = await tx.select({ status: users.status, verified: users.emailVerifiedAt, enabled: profiles.learningEmailEnabled })
      .from(users).innerJoin(profiles, eq(profiles.id, users.id)).where(eq(users.id, userId)).for("update").limit(1);
    if (!account || account.status !== "active" || !account.verified || !account.enabled) return { reason: "opted_out" };
    const [existing] = await tx.select({ id: lifecycleEmails.id, status: lifecycleEmails.status, reason: lifecycleEmails.reason, attempts: lifecycleEmails.attempts })
      .from(lifecycleEmails).where(and(eq(lifecycleEmails.userId, userId), eq(lifecycleEmails.type, candidate.type), eq(lifecycleEmails.windowKey, candidate.windowKey))).limit(1);
    if (existing && (existing.attempts >= 3 || !((existing.status === "failed" && existing.reason === "safe_pre_accept") || existing.status === "suppressed"))) return { reason: "duplicate" };
    const [recent] = await tx.select({ id: lifecycleEmails.id }).from(lifecycleEmails)
      .where(and(eq(lifecycleEmails.userId, userId), or(gte(lifecycleEmails.sentAt, new Date(now.getTime() - DAY)),
        and(eq(lifecycleEmails.status, "claimed"), gte(lifecycleEmails.claimedAt, new Date(now.getTime() - DAY)))))).limit(1);
    if (recent) {
      if (existing) await tx.update(lifecycleEmails).set({ status: "suppressed", reason: "frequency", updatedAt: now }).where(eq(lifecycleEmails.id, existing.id));
      else await tx.insert(lifecycleEmails).values({ userId, type: candidate.type, windowKey: candidate.windowKey, status: "suppressed", reason: "frequency" });
      return { reason: "frequency" };
    }
    const rawToken = createToken();
    const values = { status: "claimed", reason: null, claimedAt: now, unsubscribeTokenHash: hashToken(rawToken), updatedAt: now };
    if (existing) {
      await tx.update(lifecycleEmails).set({ ...values, attempts: existing.attempts + 1 }).where(eq(lifecycleEmails.id, existing.id));
      return { id: existing.id, rawToken };
    }
    const [row] = await tx.insert(lifecycleEmails).values({ userId, type: candidate.type, windowKey: candidate.windowKey, attempts: 1, ...values }).returning({ id: lifecycleEmails.id });
    return { id: row.id, rawToken };
  });
}

export async function runLifecycleEmails(now = new Date(), limit = 100) {
  const env = getServerEnv();
  const result = { sent: 0, suppressed: 0, failed: 0 };
  await updateReturnedToLearning();
  // Old verified accounts are considered only if they explicitly enabled learning mail.
  for (let offset = 0; ; offset += limit) {
    const accounts = await db.select({ id: users.id, email: users.email, createdAt: users.createdAt })
      .from(users).innerJoin(profiles, eq(profiles.id, users.id))
      .where(and(eq(users.status, "active"), isNotNull(users.emailVerifiedAt), eq(profiles.learningEmailEnabled, true), lt(users.createdAt, new Date(now.getTime() - DAY))))
      .orderBy(users.createdAt, users.id).limit(limit).offset(offset);
    if (!accounts.length) break;
    for (const account of accounts) {
    const facts = await learningFacts(account.id, now);
    const candidates = lifecycleCandidates({ createdAt: account.createdAt, ...facts }, now);
    const candidate = candidates[0];
    if (!candidate) continue;
    if (!(await hasAction(account.id, candidate.type, now))) {
      await db.insert(lifecycleEmails).values({ userId: account.id, type: candidate.type, windowKey: candidate.windowKey, status: "suppressed", reason: "no_action" }).onConflictDoNothing();
      result.suppressed++;
      continue;
    }
    const [goal] = await db.select({ target: learnerGoals.targetScore }).from(learnerGoals).where(eq(learnerGoals.userId, account.id)).limit(1);
    const reservation = await claim(account.id, candidate, now);
    if (!("id" in reservation)) { result.suppressed++; continue; }
    const message = lifecycleMessage(candidate.type, env.APP_URL, `${env.APP_URL}/unsubscribe?token=${encodeURIComponent(reservation.rawToken)}`,
      { sessions: facts.previousWeekSessions, hasGoal: Boolean(goal?.target) });
    try {
      const [currentPreference] = await db.select({ enabled: profiles.learningEmailEnabled }).from(profiles).where(eq(profiles.id, account.id)).limit(1);
      if (!currentPreference?.enabled) {
        await db.update(lifecycleEmails).set({ status: "suppressed", reason: "opted_out", claimedAt: null, updatedAt: new Date() }).where(eq(lifecycleEmails.id, reservation.id));
        result.suppressed++;
        continue;
      }
      await sendEngagementEmail({ to: account.email, ...message });
      await db.update(lifecycleEmails).set({ status: "sent", sentAt: new Date(), updatedAt: new Date() }).where(eq(lifecycleEmails.id, reservation.id));
      result.sent++;
    } catch (error) {
      // An ambiguous SMTP error might occur after acceptance. Never retry that claim.
      const reason = error instanceof EmailDeliveryError && error.retrySafe ? "safe_pre_accept" : "ambiguous_delivery";
      await db.update(lifecycleEmails).set({ status: "failed", reason, updatedAt: new Date() }).where(eq(lifecycleEmails.id, reservation.id));
      result.failed++;
      console.error("Lifecycle delivery failed", { type: candidate.type, reason });
    }
    }
    if (accounts.length < limit) break;
  }
  return result;
}

/** Domain-derived return signal; no opens, clicks, pixels, or external analytics. */
export async function updateReturnedToLearning() {
  await db.execute(sql`update lifecycle_emails le set returned_at = (
    select min(ps.submitted_at) from practice_sessions ps
    where ps.user_id = le.user_id and ps.status = 'submitted'
      and ps.source not in ('diagnostic','full_mock','ranked_challenge') and ps.practice_type <> 'demo_test'
      and ps.submitted_at > le.sent_at
      and exists (select 1 from attempt_answers aa where aa.session_id = ps.id and aa.user_id = ps.user_id and aa.answered_at is not null)
  ), updated_at = now()
  where le.status = 'sent' and le.returned_at is null and le.sent_at is not null
    and exists (select 1 from practice_sessions ps where ps.user_id = le.user_id and ps.status = 'submitted'
      and ps.source not in ('diagnostic','full_mock','ranked_challenge') and ps.practice_type <> 'demo_test'
      and ps.submitted_at > le.sent_at
      and exists (select 1 from attempt_answers aa where aa.session_id = ps.id and aa.user_id = ps.user_id and aa.answered_at is not null))`);
}

export async function unsubscribeLearningEmail(rawToken: string) {
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(rawToken)) return false;
  return db.transaction(async tx => {
    const [record] = await tx.select({ id: lifecycleEmails.id, userId: lifecycleEmails.userId }).from(lifecycleEmails)
      .where(eq(lifecycleEmails.unsubscribeTokenHash, hashToken(rawToken))).for("update").limit(1);
    if (!record) return false;
    await tx.update(profiles).set({ learningEmailEnabled: false, updatedAt: new Date() }).where(eq(profiles.id, record.userId));
    await tx.update(lifecycleEmails).set({ unsubscribeTokenHash: null, updatedAt: new Date() }).where(eq(lifecycleEmails.id, record.id));
    return true;
  });
}

export async function lifecycleOperations() {
  return db.select({ type: lifecycleEmails.type, status: lifecycleEmails.status, count: sql<number>`count(*)::int`, returned: sql<number>`count(*) filter (where ${lifecycleEmails.returnedAt} is not null)::int` })
    .from(lifecycleEmails).groupBy(lifecycleEmails.type, lifecycleEmails.status);
}
