import "server-only";
import { and, asc, count, desc, eq, ilike, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs, attemptAnswers, authIdentities, contentPosts, diagnosticRuns, fullMockRuns, learnerGoals, mediaAssets, passageSets, paymentOrders, practiceSessions, productEvents, profiles, questionMastery, questions, rankedChallenges, securityEvents, userPlanMemberships, userRoles, userSessions, users } from "@/db/schema";
import { grantPremiumWithTx, revokePremiumWithTx } from "@/lib/entitlements/service";
import { retentionState, retentionWindow, sortAndLimitTimeline, type UserActivityItem } from "./retention";
import type { AdminPermission } from "./permissions";
import { ROLE_PERMISSIONS } from "./permissions";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type AdminActionCode = "ACCESS_DENIED" | "USER_NOT_FOUND" | "INVALID_OPERATION" | "LAST_ADMIN" | "INVALID_DURATION";
export class AdminActionError extends Error { constructor(readonly code: AdminActionCode) { super(code); } }
export const USER_PAGE_SIZE = 20;
export const AUDIT_PAGE_SIZE = 30;

async function assertPermission(tx: Tx, actorUserId: string, permission: AdminPermission) {
  const roles = await tx.select({ role: userRoles.role }).from(userRoles).innerJoin(users, eq(users.id, userRoles.userId)).where(and(eq(userRoles.userId, actorUserId), isNull(userRoles.revokedAt), eq(users.status, "active")));
  const allowed = roles.some((row) => row.role === "ADMIN" && ROLE_PERMISSIONS.ADMIN.includes(permission));
  if (!allowed) throw new AdminActionError("ACCESS_DENIED");
}

async function assertUser(tx: Tx, userId: string) {
  const [user] = await tx.select({ id: users.id, status: users.status }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new AdminActionError("USER_NOT_FOUND");
  return user;
}

export async function grantPremiumAsAdmin(actorUserId: string, targetUserId: string, days: number) {
  return db.transaction(async (tx) => {
    await assertPermission(tx, actorUserId, "PLAN_MANAGE"); await assertUser(tx, targetUserId);
    let result; try { result = await grantPremiumWithTx(tx, { userId: targetUserId, days }); } catch (error) { if (error instanceof Error && error.message === "INVALID_DURATION") throw new AdminActionError("INVALID_DURATION"); throw error; }
    if (!result.unchanged) await tx.insert(adminAuditLogs).values({ actorUserId, targetUserId, action: "PREMIUM_GRANTED", metadata: { days, membershipId: result.membershipId, endsAt: result.endsAt?.toISOString() } });
    return result;
  });
}

export async function revokePremiumAsAdmin(actorUserId: string, targetUserId: string) {
  return db.transaction(async (tx) => {
    await assertPermission(tx, actorUserId, "PLAN_MANAGE"); await assertUser(tx, targetUserId);
    const [paid] = await tx.select({ id: userPlanMemberships.id }).from(userPlanMemberships).where(and(eq(userPlanMemberships.userId, targetUserId), eq(userPlanMemberships.source, "PAYMENT"), isNull(userPlanMemberships.revokedAt), lteNow(userPlanMemberships.startsAt), sql`(${userPlanMemberships.endsAt} is null or ${userPlanMemberships.endsAt} > now())`)).limit(1);
    if (paid) throw new AdminActionError("INVALID_OPERATION");
    const revoked = await revokePremiumWithTx(tx, { userId: targetUserId });
    if (revoked.length) await tx.insert(adminAuditLogs).values({ actorUserId, targetUserId, action: "PREMIUM_REVOKED", metadata: { membershipIds: revoked.map((row) => row.id) } });
    return revoked.length;
  });
}

export async function grantPremiumByOperator(targetUserId: string, days: number) {
  return db.transaction(async (tx) => { await assertUser(tx, targetUserId); const result = await grantPremiumWithTx(tx, { userId: targetUserId, days }); if (!result.unchanged) await tx.insert(adminAuditLogs).values({ targetUserId, action: "PREMIUM_GRANTED", metadata: { days, membershipId: result.membershipId, source: "operator_cli" } }); return result; });
}
export async function revokePremiumByOperator(targetUserId: string) {
  return db.transaction(async (tx) => { await assertUser(tx, targetUserId); const revoked = await revokePremiumWithTx(tx, { userId: targetUserId }); if (revoked.length) await tx.insert(adminAuditLogs).values({ targetUserId, action: "PREMIUM_REVOKED", metadata: { membershipIds: revoked.map((row) => row.id), source: "operator_cli" } }); return revoked.length; });
}

export async function setUserDisabled(actorUserId: string, targetUserId: string, disabled: boolean) {
  return db.transaction(async (tx) => {
    await assertPermission(tx, actorUserId, "USER_STATUS_MANAGE");
    if (disabled && actorUserId === targetUserId) throw new AdminActionError("INVALID_OPERATION");
    const target = await assertUser(tx, targetUserId); const next = disabled ? "disabled" : "active";
    if (target.status === next) return false;
    if (!disabled && target.status !== "disabled") throw new AdminActionError("INVALID_OPERATION");
    if (disabled && target.status !== "active") throw new AdminActionError("INVALID_OPERATION");
    const now = new Date();
    await tx.update(users).set({ status: next, updatedAt: now }).where(eq(users.id, targetUserId));
    if (disabled) await tx.update(userSessions).set({ revokedAt: now }).where(and(eq(userSessions.userId, targetUserId), isNull(userSessions.revokedAt)));
    await tx.insert(adminAuditLogs).values({ actorUserId, targetUserId, action: disabled ? "USER_SUSPENDED" : "USER_REACTIVATED", metadata: { previousStatus: target.status, newStatus: next } });
    return true;
  });
}

export async function grantAdminRole(targetUserId: string, actorUserId: string | null = null) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended('admin-role-membership', 0))`); await assertUser(tx, targetUserId);
    const [existing] = await tx.select({ id: userRoles.id }).from(userRoles).where(and(eq(userRoles.userId, targetUserId), eq(userRoles.role, "ADMIN"), isNull(userRoles.revokedAt))).limit(1);
    if (existing) return false;
    await tx.insert(userRoles).values({ userId: targetUserId, role: "ADMIN", createdBy: actorUserId });
    await tx.insert(adminAuditLogs).values({ actorUserId, targetUserId, action: "ADMIN_ROLE_GRANTED", metadata: { role: "ADMIN" } }); return true;
  });
}

export async function revokeAdminRole(targetUserId: string, actorUserId: string | null = null) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended('admin-role-membership', 0))`);
    const roles = await tx.select({ id: userRoles.id, userId: userRoles.userId, status: users.status }).from(userRoles).innerJoin(users, eq(users.id, userRoles.userId)).where(and(eq(userRoles.role, "ADMIN"), isNull(userRoles.revokedAt))).for("update");
    const target = roles.find((row) => row.userId === targetUserId); if (!target) throw new AdminActionError("INVALID_OPERATION");
    if (target.status === "active" && roles.filter((row) => row.status === "active").length <= 1) throw new AdminActionError("LAST_ADMIN");
    const now = new Date(); await tx.update(userRoles).set({ revokedAt: now, revokedBy: actorUserId }).where(and(eq(userRoles.userId, targetUserId), eq(userRoles.role, "ADMIN"), isNull(userRoles.revokedAt)));
    await tx.insert(adminAuditLogs).values({ actorUserId, targetUserId, action: "ADMIN_ROLE_REVOKED", metadata: { role: "ADMIN" } }); return true;
  });
}

export async function getAdminOverview() {
  const now = new Date(); const seven = new Date(now.getTime() - 7 * 86_400_000); const thirty = new Date(now.getTime() - 30 * 86_400_000);
  const [userRows, learningRows, contentRows, paymentRows, challengeRows, analyticsRows, recentAudit] = await Promise.all([
    db.select({ total: count(), active: sql<number>`count(*) filter (where ${users.status} = 'active')::int`, suspended: sql<number>`count(*) filter (where ${users.status} = 'disabled')::int`, unverified: sql<number>`count(*) filter (where ${users.emailVerifiedAt} is null)::int`, new7: sql<number>`count(*) filter (where ${users.createdAt} >= ${seven})::int`, new30: sql<number>`count(*) filter (where ${users.createdAt} >= ${thirty})::int`, premium: sql<number>`count(*) filter (where exists (select 1 from ${userPlanMemberships} m where m.user_id = ${users.id} and m.plan_key = 'PREMIUM' and m.revoked_at is null and m.starts_at <= ${now} and (m.ends_at is null or m.ends_at > ${now})))::int` }).from(users),
    db.select({ practice7: sql<number>`count(*) filter (where ${practiceSessions.status} = 'submitted' and ${practiceSessions.submittedAt} >= ${seven})::int`, learners7: sql<number>`count(distinct ${practiceSessions.userId}) filter (where ${practiceSessions.status} = 'submitted' and ${practiceSessions.submittedAt} >= ${seven})::int`, practice30: sql<number>`count(*) filter (where ${practiceSessions.status} = 'submitted' and ${practiceSessions.submittedAt} >= ${thirty})::int` }).from(practiceSessions),
    db.select({ publishedQuestions: sql<number>`count(*) filter (where ${questions.status} = 'published')::int`, draftQuestions: sql<number>`count(*) filter (where ${questions.status} = 'draft')::int`, publishedGroups: sql<number>`(select count(*)::int from ${passageSets} where ${passageSets.status} = 'published')`, draftGroups: sql<number>`(select count(*)::int from ${passageSets} where ${passageSets.status} = 'draft')`, readyMedia: sql<number>`(select count(*)::int from ${mediaAssets} where ${mediaAssets.status} = 'READY')`, publishedPosts: sql<number>`(select count(*)::int from ${contentPosts} where ${contentPosts.status} = 'PUBLISHED')` }).from(questions),
    db.select({ paid30: sql<number>`count(*) filter (where ${paymentOrders.status} = 'PAID' and ${paymentOrders.paidAt} >= ${thirty})::int`, revenue30: sql<number>`coalesce(sum(${paymentOrders.amount}) filter (where ${paymentOrders.status} = 'PAID' and ${paymentOrders.paidAt} >= ${thirty}), 0)::int`, pending: sql<number>`count(*) filter (where ${paymentOrders.status} = 'PENDING' and ${paymentOrders.expiresAt} > ${now})::int`, failed7: sql<number>`count(*) filter (where ${paymentOrders.status} = 'FAILED' and ${paymentOrders.createdAt} >= ${seven})::int` }).from(paymentOrders),
    db.select({ live: sql<number>`count(*) filter (where ${rankedChallenges.status} = 'PUBLISHED' and ${rankedChallenges.startsAt} <= ${now} and ${rankedChallenges.endsAt} > ${now})::int`, upcoming: sql<number>`count(*) filter (where ${rankedChallenges.status} = 'PUBLISHED' and ${rankedChallenges.startsAt} > ${now})::int`, drafts: sql<number>`count(*) filter (where ${rankedChallenges.status} = 'DRAFT')::int` }).from(rankedChallenges),
    db.select({ events7: sql<number>`count(*) filter (where ${productEvents.occurredAt} >= ${seven})::int`, activeActors7: sql<number>`count(distinct coalesce(${productEvents.userId}::text, ${productEvents.guestReference})) filter (where ${productEvents.occurredAt} >= ${seven})::int`, signups7: sql<number>`count(*) filter (where ${productEvents.eventName} = 'signup_completed' and ${productEvents.occurredAt} >= ${seven})::int`, checkouts7: sql<number>`count(*) filter (where ${productEvents.eventName} = 'checkout_started' and ${productEvents.occurredAt} >= ${seven})::int` }).from(productEvents),
    db.select({ action: adminAuditLogs.action, createdAt: adminAuditLogs.createdAt, actorEmail: users.email }).from(adminAuditLogs).leftJoin(users, eq(users.id, adminAuditLogs.actorUserId)).orderBy(desc(adminAuditLogs.createdAt)).limit(5),
  ]);
  const user = userRows[0];
  return { ...user, free: Number(user.total) - Number(user.premium), learning: learningRows[0], content: contentRows[0], payments: paymentRows[0], challenges: challengeRows[0], analytics: analyticsRows[0], recentAudit };
}

const lteNow = (column: typeof userPlanMemberships.startsAt) => sql`${column} <= now()`;
export type AdminUserFilters = { search?: string; plan?: string; status?: string; role?: string; verified?: string; activity?: string; learning?: string; sort?: string; page?: number };
export async function listAdminUsers(filters: AdminUserFilters) {
  const normalized = filters.search?.trim().toLowerCase().slice(0, 200) ?? ""; const page = Math.min(100000, Math.max(1, filters.page ?? 1)); const now = new Date();
  const premium = sql`exists (select 1 from ${userPlanMemberships} m where m.user_id = ${users.id} and m.plan_key = 'PREMIUM' and m.revoked_at is null and m.starts_at <= ${now} and (m.ends_at is null or m.ends_at > ${now}))`;
  const admin = sql`exists (select 1 from ${userRoles} r where r.user_id = ${users.id} and r.role = 'ADMIN' and r.revoked_at is null)`;
  const eligible = sql`ps.status = 'submitted' and ps.user_id = ${users.id} and ps.source not in ('diagnostic','full_mock','ranked_challenge') and ps.practice_type <> 'demo_test' and ps.submitted_at is not null`;
  const learningDays = sql<number>`(select count(distinct timezone('Asia/Ho_Chi_Minh', ps.submitted_at)::date)::int from practice_sessions ps where ${eligible})`;
  const lastLearning = sql<Date | null>`(select max(ps.submitted_at) from practice_sessions ps where ${eligible})`;
  const conditions = [normalized ? or(ilike(users.emailNormalized, `%${normalized}%`), ilike(profiles.fullName, `%${normalized}%`)) : undefined,
    ["active","disabled","pending_verification"].includes(filters.status ?? "") ? eq(users.status, filters.status!) : undefined,
    filters.plan === "premium" ? premium : filters.plan === "free" ? sql`not ${premium}` : undefined,
    filters.role === "admin" ? admin : filters.role === "learner" ? sql`not ${admin}` : undefined,
    filters.verified === "yes" ? isNotNull(users.emailVerifiedAt) : filters.verified === "no" ? isNull(users.emailVerifiedAt) : undefined,
    filters.activity === "recent" ? sql`${users.lastLoginAt} >= ${new Date(now.getTime() - 30 * 86_400_000)}` : filters.activity === "never" ? isNull(users.lastLoginAt) : undefined,
    filters.learning === "none" ? sql`${learningDays} = 0` : filters.learning === "one" ? sql`${learningDays} = 1` : filters.learning === "two" ? sql`${learningDays} >= 2` : filters.learning === "three" ? sql`${learningDays} >= 3` : undefined];
  const where = and(...conditions); const order = filters.sort === "login" ? [sql`${users.lastLoginAt} desc nulls last`, asc(users.id)] : filters.sort === "learning_recent" ? [sql`${lastLearning} desc nulls last`, asc(users.id)] : filters.sort === "learning_oldest" ? [sql`${lastLearning} asc nulls last`, asc(users.id)] : filters.sort === "oldest" ? [asc(users.createdAt), asc(users.id)] : filters.sort === "identity" ? [asc(users.emailNormalized), asc(users.id)] : [desc(users.createdAt), asc(users.id)];
  const [rows, [total]] = await Promise.all([
    db.select({ id: users.id, email: users.email, name: profiles.fullName, status: users.status, emailVerifiedAt: users.emailVerifiedAt, createdAt: users.createdAt, lastLoginAt: users.lastLoginAt, premium: sql<boolean>`${premium}`, admin: sql<boolean>`${admin}`, learningDays, lastLearning, sessions: sql<number>`(select count(*)::int from practice_sessions ps where ${eligible})`, questions: sql<number>`(select count(*)::int from attempt_answers aa inner join practice_sessions ps on ps.id=aa.session_id where aa.user_id=${users.id} and aa.answered_at is not null and ${eligible})`, goalTarget: learnerGoals.targetScore, goalAt: learnerGoals.updatedAt, diagnosticAt: sql<Date | null>`(select max(dr.completed_at) from diagnostic_runs dr where dr.user_id=${users.id} and dr.status='COMPLETED')`, anyLearningAt: sql<Date | null>`(select max(ps.submitted_at) from practice_sessions ps where ps.user_id=${users.id} and ps.status='submitted')`, mockAt: sql<Date | null>`(select max(fm.completed_at) from full_mock_runs fm where fm.user_id=${users.id} and fm.status='COMPLETED')`, checkoutAt: sql<Date | null>`(select max(po.created_at) from payment_orders po where po.user_id=${users.id})`, premiumAt: sql<Date | null>`(select max(pm.starts_at) from user_plan_memberships pm where pm.user_id=${users.id})` }).from(users).leftJoin(profiles, eq(profiles.id, users.id)).leftJoin(learnerGoals, eq(learnerGoals.userId, users.id)).where(where).orderBy(...order).limit(USER_PAGE_SIZE).offset((page - 1) * USER_PAGE_SIZE),
    db.select({ value: count() }).from(users).leftJoin(profiles, eq(profiles.id, users.id)).leftJoin(learnerGoals, eq(learnerGoals.userId, users.id)).where(where),
  ]);
  const mapped = rows.map((row) => {
    const actions = [["ACCOUNT_CREATED", row.createdAt], ["GOAL_CONFIGURED", row.goalAt], ["DIAGNOSTIC_COMPLETED", row.diagnosticAt], ["LEARNING_COMPLETED", row.anyLearningAt], ["MOCK_COMPLETED", row.mockAt], ["CHECKOUT_STARTED", row.checkoutAt], ["PREMIUM_ACTIVATED", row.premiumAt]] as const;
    const latest = actions.filter((item): item is readonly [typeof item[0], Date] => item[1] instanceof Date).sort((a, b) => b[1].getTime() - a[1].getTime())[0];
    return { ...row, retentionState: retentionState(Number(row.learningDays), row.lastLearning, now), lastMeaningfulAction: latest[0], lastMeaningfulAt: latest[1] };
  });
  return { rows: mapped, total: Number(total.value), page, pageSize: USER_PAGE_SIZE };
}

export async function getAdminUser(userId: string) {
  const [user] = await db.select({ id: users.id, email: users.email, name: profiles.fullName, avatarUrl: profiles.avatarUrl, status: users.status, emailVerifiedAt: users.emailVerifiedAt, createdAt: users.createdAt, lastLoginAt: users.lastLoginAt, hasPassword: sql<boolean>`${users.passwordHash} is not null`, admin: sql<boolean>`exists (select 1 from ${userRoles} r where r.user_id=${users.id} and r.role='ADMIN' and r.revoked_at is null)`, googleLinked: sql<boolean>`exists (select 1 from ${authIdentities} a where a.user_id=${users.id} and a.provider='google')`, activeSessions: sql<number>`(select count(*)::int from ${userSessions} s where s.user_id=${users.id} and s.revoked_at is null and s.expires_at > now())` }).from(users).leftJoin(profiles, eq(profiles.id, users.id)).where(eq(users.id, userId)).limit(1); return user ?? null;
}

export async function getUserOperations(userId: string) {
  const [recentLearning, audit, security, payments] = await Promise.all([
    db.select({ id: practiceSessions.id, skillArea: practiceSessions.skillArea, part: practiceSessions.part, source: practiceSessions.source, total: practiceSessions.scoreTotal, correct: practiceSessions.scoreCorrect, submittedAt: practiceSessions.submittedAt }).from(practiceSessions).where(and(eq(practiceSessions.userId,userId),eq(practiceSessions.status,"submitted"))).orderBy(desc(practiceSessions.submittedAt)).limit(8),
    db.select({ id: adminAuditLogs.id, action: adminAuditLogs.action, createdAt: adminAuditLogs.createdAt, metadata: adminAuditLogs.metadata }).from(adminAuditLogs).where(eq(adminAuditLogs.targetUserId,userId)).orderBy(desc(adminAuditLogs.createdAt)).limit(20),
    db.select({ id: securityEvents.id, eventType: securityEvents.eventType, createdAt: securityEvents.createdAt }).from(securityEvents).where(eq(securityEvents.userId,userId)).orderBy(desc(securityEvents.createdAt)).limit(10),
    db.select({ id: paymentOrders.id, orderCode: paymentOrders.orderCode, status: paymentOrders.status, productKey: paymentOrders.productKey, createdAt: paymentOrders.createdAt, paidAt: paymentOrders.paidAt }).from(paymentOrders).where(eq(paymentOrders.userId,userId)).orderBy(desc(paymentOrders.createdAt)).limit(10),
  ]); return { recentLearning, audit, security, payments };
}

export async function getLearningSummary(userId: string) {
  const [[sessions], [answers], [diagnostic], [mocks], [mistakes]] = await Promise.all([
    db.select({ count: count() }).from(practiceSessions).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "submitted"))),
    db.select({ total: count(), correct: sql<number>`count(*) filter (where ${attemptAnswers.isCorrect})::int` }).from(attemptAnswers).where(eq(attemptAnswers.userId, userId)),
    db.select({ count: count() }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, userId), eq(diagnosticRuns.status, "COMPLETED"))),
    db.select({ count: count() }).from(fullMockRuns).where(eq(fullMockRuns.userId, userId)),
    db.select({ count: count() }).from(questionMastery).where(and(eq(questionMastery.userId, userId), eq(questionMastery.status, "UNRESOLVED"))),
  ]); const total = Number(answers.total); return { submittedSessions: Number(sessions.count), answeredQuestions: total, accuracy: total ? Math.round(Number(answers.correct) / total * 100) : null, diagnosticCompleted: Number(diagnostic.count) > 0, fullMockCount: Number(mocks.count), unresolvedMistakes: Number(mistakes.count) };
}

export async function getAdminRetentionMetrics(now = new Date()) {
  const window = retentionWindow(now);
  const result = await db.execute(sql`
    with learner_days as (
      select user_id, count(distinct timezone('Asia/Ho_Chi_Minh', submitted_at)::date)::int learning_days
      from practice_sessions
      where status='submitted' and user_id is not null and submitted_at >= ${window.start} and submitted_at < ${window.end}
        and source not in ('diagnostic','full_mock','ranked_challenge') and practice_type <> 'demo_test'
      group by user_id
    ), lifetime as (
      select distinct user_id from practice_sessions
      where status='submitted' and user_id is not null and source not in ('diagnostic','full_mock','ranked_challenge') and practice_type <> 'demo_test'
    )
    select count(*)::int total_learners,
      count(*) filter (where u.created_at >= ${window.start} and u.created_at < ${window.end})::int signups_7d,
      count(*) filter (where lifetime.user_id is not null)::int activated,
      count(*) filter (where coalesce(learner_days.learning_days,0)=1)::int one_day,
      count(*) filter (where coalesce(learner_days.learning_days,0)>=2)::int two_plus_days,
      count(*) filter (where coalesce(learner_days.learning_days,0)>=3)::int three_plus_days,
      count(*) filter (where lifetime.user_id is null)::int no_learning
    from users u left join learner_days on learner_days.user_id=u.id left join lifetime on lifetime.user_id=u.id
  `);
  const row = result.rows[0] as Record<string, number | string>;
  return { totalLearners: Number(row.total_learners), signups7d: Number(row.signups_7d), activated: Number(row.activated), oneDay: Number(row.one_day), twoPlusDays: Number(row.two_plus_days), threePlusDays: Number(row.three_plus_days), noLearning: Number(row.no_learning), window };
}

export async function getAdminUserLearningSummary(userId: string) {
  const [row] = await db.select({
    learningDays: sql<number>`count(distinct timezone('Asia/Ho_Chi_Minh', ${practiceSessions.submittedAt})::date)::int`,
    sessions: sql<number>`count(distinct ${practiceSessions.id})::int`,
    questions: sql<number>`count(distinct ${attemptAnswers.id})::int`,
    lastLearning: sql<Date | null>`max(${practiceSessions.submittedAt})`,
  }).from(practiceSessions).leftJoin(attemptAnswers, and(eq(attemptAnswers.sessionId, practiceSessions.id), isNotNull(attemptAnswers.answeredAt))).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "submitted"), sql`${practiceSessions.source} not in ('diagnostic','full_mock','ranked_challenge')`, sql`${practiceSessions.practiceType} <> 'demo_test'`));
  const [goal] = await db.select({ targetScore: learnerGoals.targetScore, examDate: learnerGoals.examDate, dailyStudyMinutes: learnerGoals.dailyStudyMinutes, studyDaysPerWeek: learnerGoals.studyDaysPerWeek }).from(learnerGoals).where(eq(learnerGoals.userId, userId)).limit(1);
  return { learningDays: Number(row?.learningDays ?? 0), sessions: Number(row?.sessions ?? 0), questions: Number(row?.questions ?? 0), lastLearning: row?.lastLearning ?? null, goal: goal ?? null };
}

export async function getUserActivityTimeline(userId: string, limit = 100) {
  const [account, goals, diagnostics, practices, mocks, payments, memberships] = await Promise.all([
    db.select({ id: users.id, occurredAt: users.createdAt }).from(users).where(eq(users.id, userId)).limit(1),
    db.select({ occurredAt: learnerGoals.updatedAt, targetScore: learnerGoals.targetScore, examDate: learnerGoals.examDate, dailyStudyMinutes: learnerGoals.dailyStudyMinutes, studyDaysPerWeek: learnerGoals.studyDaysPerWeek }).from(learnerGoals).where(eq(learnerGoals.userId, userId)).limit(1),
    db.select({ id: diagnosticRuns.id, status: diagnosticRuns.status, purpose: diagnosticRuns.purpose, createdAt: diagnosticRuns.createdAt, completedAt: diagnosticRuns.completedAt }).from(diagnosticRuns).where(eq(diagnosticRuns.userId, userId)).orderBy(desc(diagnosticRuns.createdAt)).limit(20),
    db.select({ id: practiceSessions.id, source: practiceSessions.source, part: practiceSessions.part, status: practiceSessions.status, startedAt: practiceSessions.startedAt, submittedAt: practiceSessions.submittedAt, total: practiceSessions.scoreTotal, correct: practiceSessions.scoreCorrect }).from(practiceSessions).where(eq(practiceSessions.userId, userId)).orderBy(desc(practiceSessions.startedAt)).limit(50),
    db.select({ id: fullMockRuns.id, mode: fullMockRuns.mode, status: fullMockRuns.status, createdAt: fullMockRuns.createdAt, completedAt: fullMockRuns.completedAt }).from(fullMockRuns).where(eq(fullMockRuns.userId, userId)).orderBy(desc(fullMockRuns.createdAt)).limit(20),
    db.select({ id: paymentOrders.id, status: paymentOrders.status, productKey: paymentOrders.productKey, createdAt: paymentOrders.createdAt, paidAt: paymentOrders.paidAt }).from(paymentOrders).where(eq(paymentOrders.userId, userId)).orderBy(desc(paymentOrders.createdAt)).limit(20),
    db.select({ id: userPlanMemberships.id, startsAt: userPlanMemberships.startsAt, endsAt: userPlanMemberships.endsAt, source: userPlanMemberships.source }).from(userPlanMemberships).where(eq(userPlanMemberships.userId, userId)).orderBy(desc(userPlanMemberships.startsAt)).limit(20),
  ]);
  const items: UserActivityItem[] = account.map((x) => ({ id: `account:${x.id}`, occurredAt: x.occurredAt, category: "ACCOUNT", action: "ACCOUNT_CREATED", source: "users", summary: null, metadata: {} }));
  for (const x of goals) items.push({ id: `goal:${userId}`, occurredAt: x.occurredAt, category: "GOAL", action: "GOAL_CONFIGURED", source: "learner_goals", summary: null, metadata: { targetScore: x.targetScore, examDate: x.examDate, dailyStudyMinutes: x.dailyStudyMinutes, studyDaysPerWeek: x.studyDaysPerWeek } });
  for (const x of diagnostics) { items.push({ id: `diagnostic:${x.id}:started`, occurredAt: x.createdAt, category: "DIAGNOSTIC", action: "DIAGNOSTIC_STARTED", source: "diagnostic_runs", summary: x.purpose, metadata: {} }); if (x.completedAt) items.push({ id: `diagnostic:${x.id}:completed`, occurredAt: x.completedAt, category: "DIAGNOSTIC", action: "DIAGNOSTIC_COMPLETED", source: "diagnostic_runs", summary: x.purpose, metadata: {} }); }
  for (const x of practices) { const category = x.source === "recommended" ? "WORKOUT" : x.source === "mastery_review" ? "REVIEW" : x.source === "diagnostic" ? "DIAGNOSTIC" : x.source === "full_mock" ? "MOCK" : "PRACTICE"; if (category === "PRACTICE" || category === "WORKOUT" || category === "REVIEW") items.push({ id: `practice:${x.id}:started`, occurredAt: x.startedAt, category, action: `${category}_STARTED`, source: "practice_sessions", summary: x.part ? `Part ${x.part}` : null, metadata: {} }); if (x.submittedAt && (category === "PRACTICE" || category === "WORKOUT" || category === "REVIEW")) items.push({ id: `practice:${x.id}:completed`, occurredAt: x.submittedAt, category, action: `${category}_COMPLETED`, source: "practice_sessions", summary: x.part ? `Part ${x.part}` : null, metadata: { questions: x.total, correct: x.correct, accuracy: x.total && x.correct !== null ? Math.round(x.correct / x.total * 100) : null } }); }
  for (const x of mocks) { items.push({ id: `mock:${x.id}:started`, occurredAt: x.createdAt, category: "MOCK", action: "MOCK_STARTED", source: "full_mock_runs", summary: x.mode, metadata: {} }); if (x.completedAt) items.push({ id: `mock:${x.id}:completed`, occurredAt: x.completedAt, category: "MOCK", action: "MOCK_COMPLETED", source: "full_mock_runs", summary: x.mode, metadata: {} }); }
  for (const x of payments) { items.push({ id: `payment:${x.id}:created`, occurredAt: x.createdAt, category: "PREMIUM", action: "CHECKOUT_STARTED", source: "payment_orders", summary: x.productKey, metadata: { status: x.status } }); }
  for (const x of memberships) items.push({ id: `membership:${x.id}`, occurredAt: x.startsAt, category: "PREMIUM", action: "PREMIUM_ACTIVATED", source: "user_plan_memberships", summary: x.source, metadata: { endsAt: x.endsAt?.toISOString() ?? null } });
  return sortAndLimitTimeline(items, limit);
}

export async function listAuditLogs(page: number) {
  const actor = users; const rows = await db.select({ id: adminAuditLogs.id, action: adminAuditLogs.action, actorUserId: adminAuditLogs.actorUserId, targetUserId: adminAuditLogs.targetUserId, metadata: adminAuditLogs.metadata, createdAt: adminAuditLogs.createdAt }).from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt), desc(adminAuditLogs.id)).limit(AUDIT_PAGE_SIZE).offset((page - 1) * AUDIT_PAGE_SIZE);
  const ids = [...new Set(rows.flatMap((row) => [row.actorUserId, row.targetUserId]).filter((id): id is string => Boolean(id)))]; const names = ids.length ? await db.select({ id: actor.id, email: actor.email }).from(actor).where(inArray(actor.id, ids)) : [];
  const map = new Map(names.map((item) => [item.id, item.email])); const [total] = await db.select({ value: count() }).from(adminAuditLogs); return { rows: rows.map((row) => ({ ...row, actorEmail: row.actorUserId ? map.get(row.actorUserId) ?? null : null, targetEmail: row.targetUserId ? map.get(row.targetUserId) ?? null : null })), total: Number(total.value), page, pageSize: AUDIT_PAGE_SIZE };
}
