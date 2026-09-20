import "server-only";
import { and, eq, gte, lt, sql, type AnyColumn } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, diagnosticRuns, fullMockRuns, practiceSessions, questionMastery, userPlanMemberships } from "@/db/schema";

export type PremiumValueRecap = {
  windowDays: 30;
  windowStart: Date;
  questionsAnswered: number;
  practiceSessionsCompleted: number;
  mistakesMastered: number;
  mocksCompleted: number;
  reassessmentsCompleted: number;
};

export async function getPremiumValueRecap(userId: string, now = new Date()): Promise<PremiumValueRecap> {
  const windowStart = new Date(now.getTime() - 30 * 86_400_000);
  // Count only activity that happened while a real Premium grant/payment was effective.
  const duringPremium = (timestamp: AnyColumn) => sql`exists (select 1 from ${userPlanMemberships} m where m.user_id = ${userId} and m.plan_key = 'PREMIUM' and m.starts_at <= ${timestamp} and (m.ends_at is null or m.ends_at > ${timestamp}) and (m.revoked_at is null or m.revoked_at > ${timestamp}))`;
  const [[answers], [sessions], [mastered], [mocks], [reassessments]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(attemptAnswers).where(and(eq(attemptAnswers.userId, userId), gte(attemptAnswers.createdAt, windowStart), lt(attemptAnswers.createdAt, now), duringPremium(attemptAnswers.createdAt))),
    db.select({ count: sql<number>`count(*)::int` }).from(practiceSessions).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "submitted"), gte(practiceSessions.submittedAt, windowStart), lt(practiceSessions.submittedAt, now), duringPremium(practiceSessions.submittedAt), sql`${practiceSessions.source} not in ('diagnostic','full_mock','ranked_challenge')`)),
    db.select({ count: sql<number>`count(*)::int` }).from(questionMastery).where(and(eq(questionMastery.userId, userId), eq(questionMastery.status, "MASTERED"), gte(questionMastery.masteredAt, windowStart), lt(questionMastery.masteredAt, now), duringPremium(questionMastery.masteredAt))),
    db.select({ count: sql<number>`count(*)::int` }).from(fullMockRuns).where(and(eq(fullMockRuns.userId, userId), eq(fullMockRuns.status, "COMPLETED"), gte(fullMockRuns.completedAt, windowStart), lt(fullMockRuns.completedAt, now), duringPremium(fullMockRuns.completedAt))),
    db.select({ count: sql<number>`count(*)::int` }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, userId), eq(diagnosticRuns.status, "COMPLETED"), eq(diagnosticRuns.purpose, "REASSESSMENT"), gte(diagnosticRuns.completedAt, windowStart), lt(diagnosticRuns.completedAt, now), duringPremium(diagnosticRuns.completedAt))),
  ]);
  return {
    windowDays: 30,
    windowStart,
    questionsAnswered: Number(answers?.count ?? 0),
    practiceSessionsCompleted: Number(sessions?.count ?? 0),
    mistakesMastered: Number(mastered?.count ?? 0),
    mocksCompleted: Number(mocks?.count ?? 0),
    reassessmentsCompleted: Number(reassessments?.count ?? 0),
  };
}
