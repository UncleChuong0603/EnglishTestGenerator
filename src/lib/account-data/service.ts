import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  accountActivationTokens,
  adminAuditLogs,
  authIdentities,
  demoTestAnswers,
  diagnosticRuns,
  emailVerificationTokens,
  fullMockAnswers,
  fullMockRuns,
  gamificationEvents,
  learnerContexts,
  learnerGoals,
  lifecycleEmails,
  mediaAssets,
  mobileNotificationPreferences,
  mobilePushDeliveries,
  mobilePushDevices,
  oauthStates,
  passwordResetTokens,
  paymentOrders,
  practiceSessions,
  productEvents,
  profiles,
  questionBankSettings,
  questionMastery,
  questionReports,
  rankedChallengeRuns,
  securityEvents,
  storePurchaseEvents,
  storePurchases,
  studyStreaks,
  supportTickets,
  usageConsumptions,
  userPlanMemberships,
  userRoles,
  userSessions,
  userVocabulary,
  users,
  weeklyPlanSnapshots,
  attemptAnswers,
  apiIdempotencyKeys,
} from "@/db/schema";
import { normalizeEmail } from "@/lib/auth/crypto";

export const LEARNING_DATA_EXPORT_VERSION = "2026-10-04";

export class AccountDataError extends Error {
  constructor(readonly code: "NOT_FOUND" | "CONFIRMATION_MISMATCH" | "ADMIN_HANDOFF_REQUIRED" | "PRIVATE_DATA_HANDOFF_REQUIRED") {
    super(code);
  }
}

/**
 * Creates a user-owned, machine-readable snapshot. The allowlist intentionally
 * excludes password/session/token hashes, OAuth provider IDs and storage keys.
 */
export async function exportLearningData(userId: string, exportedAt = new Date()) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`set transaction isolation level repeatable read, read only`);
    const [account] = await tx.select({
      id: users.id,
      email: users.email,
      emailVerifiedAt: users.emailVerifiedAt,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(and(eq(users.id, userId), sql`${users.deletedAt} is null`)).limit(1);
    if (!account) throw new AccountDataError("NOT_FOUND");

    const [
      profileRows,
      goalRows,
      contextRows,
      authMethodRows,
      practiceRows,
      answerRows,
      masteryRows,
      vocabularyRows,
      planRows,
      streakRows,
      diagnosticRows,
      mockRows,
      challengeRows,
      gamificationRows,
      membershipRows,
      usageRows,
      paymentRows,
      emailRows,
      supportRows,
    ] = [
      await tx.select().from(profiles).where(eq(profiles.id, userId)),
      await tx.select().from(learnerGoals).where(eq(learnerGoals.userId, userId)),
      await tx.select().from(learnerContexts).where(eq(learnerContexts.userId, userId)),
      await tx.select({ provider: authIdentities.provider, createdAt: authIdentities.createdAt }).from(authIdentities).where(eq(authIdentities.userId, userId)),
      await tx.select({
        id: practiceSessions.id, skillArea: practiceSessions.skillArea, practiceType: practiceSessions.practiceType,
        part: practiceSessions.part, status: practiceSessions.status, questionCount: practiceSessions.questionCount,
        startedAt: practiceSessions.startedAt, submittedAt: practiceSessions.submittedAt,
        // Scores can reveal answers to an unfinished parent exam.
        scoreCorrect: sql<number | null>`case when ${practiceSessions.status} = 'submitted'
          and (${practiceSessions.fullMockRunId} is null or exists (select 1 from full_mock_runs fm where fm.id = ${practiceSessions.fullMockRunId} and fm.status = 'COMPLETED'))
          and (${practiceSessions.diagnosticRunId} is null or exists (select 1 from diagnostic_runs dr where dr.id = ${practiceSessions.diagnosticRunId} and dr.status = 'COMPLETED'))
          and ${practiceSessions.rankedChallengeRunId} is null then ${practiceSessions.scoreCorrect} else null end`,
        scoreTotal: practiceSessions.scoreTotal,
        source: practiceSessions.source, requestedQuestionCount: practiceSessions.requestedQuestionCount,
        requestedSkill: practiceSessions.requestedSkill, requestedSubSkill: practiceSessions.requestedSubSkill,
      }).from(practiceSessions).where(eq(practiceSessions.userId, userId)),
      await tx.select({
        id: attemptAnswers.id,
        sessionId: attemptAnswers.sessionId,
        questionId: attemptAnswers.questionId,
        selectedOptionId: attemptAnswers.selectedOptionId,
        // Mock/diagnostic section answers can exist before the parent run is
        // complete; export must obey the same release boundary as results.
        isCorrect: sql<boolean | null>`case when ${practiceSessions.status} = 'submitted'
          and (${practiceSessions.fullMockRunId} is null or exists (select 1 from full_mock_runs fm where fm.id = ${practiceSessions.fullMockRunId} and fm.status = 'COMPLETED'))
          and (${practiceSessions.diagnosticRunId} is null or exists (select 1 from diagnostic_runs dr where dr.id = ${practiceSessions.diagnosticRunId} and dr.status = 'COMPLETED'))
          and ${practiceSessions.rankedChallengeRunId} is null
          then ${attemptAnswers.isCorrect} else null end`,
        responseTimeMs: attemptAnswers.responseTimeMs,
        answeredAt: attemptAnswers.answeredAt,
        createdAt: attemptAnswers.createdAt,
      }).from(attemptAnswers).innerJoin(practiceSessions, and(eq(practiceSessions.id, attemptAnswers.sessionId), eq(practiceSessions.userId, attemptAnswers.userId))).where(eq(attemptAnswers.userId, userId)),
      await tx.select().from(questionMastery).where(eq(questionMastery.userId, userId)),
      await tx.select().from(userVocabulary).where(eq(userVocabulary.userId, userId)),
      await tx.select().from(weeklyPlanSnapshots).where(eq(weeklyPlanSnapshots.userId, userId)),
      await tx.select().from(studyStreaks).where(eq(studyStreaks.userId, userId)),
      await tx.select({ id: diagnosticRuns.id, status: diagnosticRuns.status, purpose: diagnosticRuns.purpose,
        createdAt: diagnosticRuns.createdAt, expiresAt: diagnosticRuns.expiresAt,
        completedAt: diagnosticRuns.completedAt }).from(diagnosticRuns).where(eq(diagnosticRuns.userId, userId)),
      await tx.select().from(fullMockRuns).where(eq(fullMockRuns.userId, userId)),
      await tx.select({ id: rankedChallengeRuns.id, challengeId: rankedChallengeRuns.challengeId,
        status: rankedChallengeRuns.status, startedAt: rankedChallengeRuns.startedAt,
        completedAt: rankedChallengeRuns.completedAt }).from(rankedChallengeRuns).where(eq(rankedChallengeRuns.userId, userId)),
      await tx.select().from(gamificationEvents).where(eq(gamificationEvents.userId, userId)),
      await tx.select().from(userPlanMemberships).where(eq(userPlanMemberships.userId, userId)),
      await tx.select().from(usageConsumptions).where(eq(usageConsumptions.userId, userId)),
      await tx.select({
        id: paymentOrders.id,
        productKey: paymentOrders.productKey,
        provider: paymentOrders.provider,
        orderCode: paymentOrders.orderCode,
        amount: paymentOrders.amount,
        currency: paymentOrders.currency,
        status: paymentOrders.status,
        expiresAt: paymentOrders.expiresAt,
        paidAt: paymentOrders.paidAt,
        cancelledAt: paymentOrders.cancelledAt,
        createdAt: paymentOrders.createdAt,
        updatedAt: paymentOrders.updatedAt,
      }).from(paymentOrders).where(eq(paymentOrders.userId, userId)),
      await tx.select({
        type: lifecycleEmails.type,
        windowKey: lifecycleEmails.windowKey,
        status: lifecycleEmails.status,
        reason: lifecycleEmails.reason,
        sentAt: lifecycleEmails.sentAt,
        returnedAt: lifecycleEmails.returnedAt,
        attempts: lifecycleEmails.attempts,
        createdAt: lifecycleEmails.createdAt,
      }).from(lifecycleEmails).where(eq(lifecycleEmails.userId, userId)),
      await tx.select({
        id: supportTickets.id,
        category: supportTickets.category,
        subject: supportTickets.subject,
        message: supportTickets.message,
        status: supportTickets.status,
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt,
      }).from(supportTickets).where(eq(supportTickets.userId, userId)),
    ] as const;

    const [demoDrafts, mockDrafts, reports] = [
      await tx.select({ sessionId: demoTestAnswers.sessionId, questionId: demoTestAnswers.questionId,
        selectedOptionId: demoTestAnswers.selectedOptionId, answeredAt: demoTestAnswers.answeredAt }).from(demoTestAnswers).where(eq(demoTestAnswers.userId, userId)),
      await tx.select({ sessionId: fullMockAnswers.sessionId, questionId: fullMockAnswers.questionId,
        selectedOptionId: fullMockAnswers.selectedOptionId, answeredAt: fullMockAnswers.answeredAt }).from(fullMockAnswers).where(eq(fullMockAnswers.userId, userId)),
      await tx.select({ id: questionReports.id, questionId: questionReports.questionId,
        sourceType: questionReports.sourceType, reason: questionReports.reason,
        description: questionReports.description, status: questionReports.status,
        createdAt: questionReports.createdAt, updatedAt: questionReports.updatedAt })
        .from(questionReports).where(eq(questionReports.reporterUserId, userId)),
    ] as const;
    const [notificationPreferences] = await tx.select({
      enabled: mobileNotificationPreferences.enabled,
      todaysWorkout: mobileNotificationPreferences.todaysWorkout,
      vocabularyDue: mobileNotificationPreferences.vocabularyDue,
      unresolvedReview: mobileNotificationPreferences.unresolvedReview,
      weeklyReview: mobileNotificationPreferences.weeklyReview,
      streak: mobileNotificationPreferences.streak,
      updatedAt: mobileNotificationPreferences.updatedAt,
    }).from(mobileNotificationPreferences).where(eq(mobileNotificationPreferences.userId, userId)).limit(1);
    const [storeRows, storeEventRows] = await Promise.all([
      tx.select({ id: storePurchases.id, provider: storePurchases.provider, productId: storePurchases.productId, status: storePurchases.status, environment: storePurchases.environment, startsAt: storePurchases.startsAt, expiresAt: storePurchases.expiresAt, revokedAt: storePurchases.revokedAt, createdAt: storePurchases.createdAt, updatedAt: storePurchases.updatedAt }).from(storePurchases).where(eq(storePurchases.userId, userId)),
      tx.select({ provider: storePurchaseEvents.provider, eventType: storePurchaseEvents.eventType, processingStatus: storePurchaseEvents.processingStatus, receivedAt: storePurchaseEvents.receivedAt, processedAt: storePurchaseEvents.processedAt }).from(storePurchaseEvents).innerJoin(storePurchases, eq(storePurchases.id, storePurchaseEvents.purchaseId)).where(eq(storePurchases.userId, userId)),
    ]);
    return {
      format: "toeicgym-learning-data" as const,
      version: LEARNING_DATA_EXPORT_VERSION,
      exportedAt: exportedAt.toISOString(),
      account: {
        ...account,
        authMethods: {
          password: await tx.select({ id: users.id }).from(users).where(and(eq(users.id, userId), sql`${users.passwordHash} is not null`)).limit(1).then((rows) => rows.length > 0),
          providers: authMethodRows.map((row) => ({ provider: row.provider, linkedAt: row.createdAt })),
        },
      },
      profile: profileRows[0] ?? null,
      learningGoal: goalRows[0] ?? null,
      learningContext: contextRows[0] ?? null,
      learning: {
        practiceSessions: practiceRows,
        answers: answerRows,
        draftAnswers: { demo: demoDrafts, mock: mockDrafts },
        mistakeMastery: masteryRows,
        vocabulary: vocabularyRows,
        weeklyPlans: planRows,
        streak: streakRows[0] ?? null,
        diagnostics: diagnosticRows,
        mocks: mockRows,
        rankedChallenges: challengeRows,
        gamification: gamificationRows,
      },
      planAndBilling: { memberships: membershipRows, usage: usageRows, payments: paymentRows, storePurchases: storeRows, storeEvents: storeEventRows },
      communications: { notificationPreferences: notificationPreferences ?? null, lifecycleEmails: emailRows, supportTickets: supportRows, questionReports: reports },
    };
  });
}

export type DeleteAccountResult = { status: "deleted" | "already_deleted"; deletedAt: Date };

/**
 * Erases learner/auth data in one transaction and leaves an anonymous user
 * tombstone only where payment or authored administrative records require a FK.
 */
export async function deleteAccount(userId: string, confirmationEmail: string, now = new Date()): Promise<DeleteAccountResult> {
  return db.transaction(async (tx) => {
    const [account] = await tx.select({
      id: users.id,
      emailNormalized: users.emailNormalized,
      deletedAt: users.deletedAt,
    }).from(users).where(eq(users.id, userId)).for("update").limit(1);
    if (!account) throw new AccountDataError("NOT_FOUND");
    if (account.deletedAt) return { status: "already_deleted", deletedAt: account.deletedAt };
    if (normalizeEmail(confirmationEmail) !== account.emailNormalized) throw new AccountDataError("CONFIRMATION_MISMATCH");

    const [adminRole] = await tx.select({ id: userRoles.id }).from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, "ADMIN"), sql`${userRoles.revokedAt} is null`)).limit(1);
    if (adminRole) throw new AccountDataError("ADMIN_HANDOFF_REQUIRED");
    // No current learner flow uploads private media. Fail closed if legacy or
    // future private blobs exist until their durable erasure job is available.
    const [privateMedia] = await tx.select({ id: mediaAssets.id }).from(mediaAssets).where(eq(mediaAssets.ownerUserId, userId)).limit(1);
    if (privateMedia) throw new AccountDataError("PRIVATE_DATA_HANDOFF_REQUIRED");

    // A row lock serializes duplicate requests; every mutation below is retry-safe.
    // Learner-authored report text is personal data. Removing it does not remove
    // the published correction or remediation mappings on practice assignments.
    await tx.delete(questionReports).where(eq(questionReports.reporterUserId, userId));
    await tx.update(questionReports).set({ reviewedBy: null }).where(eq(questionReports.reviewedBy, userId));
    await tx.delete(rankedChallengeRuns).where(eq(rankedChallengeRuns.userId, userId));
    await tx.delete(fullMockRuns).where(eq(fullMockRuns.userId, userId));
    await tx.delete(diagnosticRuns).where(eq(diagnosticRuns.userId, userId));
    await tx.delete(practiceSessions).where(eq(practiceSessions.userId, userId));
    await tx.delete(attemptAnswers).where(eq(attemptAnswers.userId, userId));
    await tx.delete(demoTestAnswers).where(eq(demoTestAnswers.userId, userId));
    await tx.delete(fullMockAnswers).where(eq(fullMockAnswers.userId, userId));
    await tx.delete(questionMastery).where(eq(questionMastery.userId, userId));
    await tx.delete(userVocabulary).where(eq(userVocabulary.userId, userId));
    await tx.delete(weeklyPlanSnapshots).where(eq(weeklyPlanSnapshots.userId, userId));
    await tx.delete(learnerGoals).where(eq(learnerGoals.userId, userId));
    await tx.delete(learnerContexts).where(eq(learnerContexts.userId, userId));
    await tx.delete(studyStreaks).where(eq(studyStreaks.userId, userId));
    await tx.delete(gamificationEvents).where(eq(gamificationEvents.userId, userId));
    await tx.delete(usageConsumptions).where(eq(usageConsumptions.userId, userId));

    // Payment-backed membership and order rows are legal/accounting records.
    // They retain only the anonymous tombstone FK and non-secret provider facts.
    await tx.delete(userPlanMemberships).where(and(eq(userPlanMemberships.userId, userId), sql`${userPlanMemberships.source} not in ('PAYOS','APPLE_IAP','GOOGLE_PLAY')`));
    await tx.update(userPlanMemberships).set({ revokedAt: now, updatedAt: now })
      .where(and(eq(userPlanMemberships.userId, userId), sql`${userPlanMemberships.source} in ('PAYOS','APPLE_IAP','GOOGLE_PLAY')`));
    await tx.update(paymentOrders).set({ checkoutUrl: null, updatedAt: now }).where(eq(paymentOrders.userId, userId));

    await tx.delete(lifecycleEmails).where(eq(lifecycleEmails.userId, userId));
    await tx.delete(mobilePushDeliveries).where(eq(mobilePushDeliveries.userId, userId));
    await tx.delete(mobilePushDevices).where(eq(mobilePushDevices.userId, userId));
    await tx.delete(mobileNotificationPreferences).where(eq(mobileNotificationPreferences.userId, userId));
    await tx.delete(supportTickets).where(eq(supportTickets.userId, userId));
    await tx.update(productEvents).set({
      userId: null,
      guestReference: null,
      sessionId: null,
      route: null,
      deduplicationKey: null,
      properties: {},
    }).where(eq(productEvents.userId, userId));
    await tx.update(securityEvents).set({ userId: null, metadata: {} }).where(eq(securityEvents.userId, userId));
    await tx.update(adminAuditLogs).set({ actorUserId: null, metadata: {} }).where(eq(adminAuditLogs.actorUserId, userId));
    await tx.update(adminAuditLogs).set({ targetUserId: null, metadata: {} }).where(eq(adminAuditLogs.targetUserId, userId));
    await tx.update(questionBankSettings).set({ updatedBy: null }).where(eq(questionBankSettings.updatedBy, userId));

    await tx.delete(authIdentities).where(eq(authIdentities.userId, userId));
    await tx.delete(oauthStates).where(eq(oauthStates.linkUserId, userId));
    await tx.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    await tx.delete(accountActivationTokens).where(eq(accountActivationTokens.userId, userId));
    await tx.delete(userSessions).where(eq(userSessions.userId, userId));
    await tx.delete(apiIdempotencyKeys).where(eq(apiIdempotencyKeys.userId, userId));
    await tx.update(userRoles).set({ createdBy: null }).where(eq(userRoles.createdBy, userId));
    await tx.update(userRoles).set({ revokedBy: null }).where(eq(userRoles.revokedBy, userId));
    await tx.delete(userRoles).where(eq(userRoles.userId, userId));
    await tx.delete(profiles).where(eq(profiles.id, userId));

    const anonymousEmail = `deleted+${userId}@deleted.invalid`;
    await tx.update(users).set({
      email: anonymousEmail,
      emailNormalized: anonymousEmail,
      passwordHash: null,
      emailVerifiedAt: null,
      status: "disabled",
      deletedAt: now,
      lastLoginAt: null,
      updatedAt: now,
    }).where(eq(users.id, userId));

    return { status: "deleted", deletedAt: now };
  });
}
