import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { practiceAnswerDrafts, profiles, users } from "@/db/schema";
import { getUserAuthMethods } from "@/lib/auth/service";
import { getDashboardData } from "@/lib/dashboard/service";
import { getEffectiveCapabilities, getMembershipState, getUsageStatus } from "@/lib/entitlements/service";
import { getLearnerGoal } from "@/lib/goals/service";
import { getMistakeBank } from "@/lib/mastery/queries";
import { getLatestReasonsForQuestions } from "@/lib/mistake-reasons/service";
import { getPracticeResult, getPracticeSession } from "@/lib/practice/queries";
import { getToeicProgress } from "@/lib/progress/queries";
import type { ProgressCounts } from "@/lib/progress/types";
import { getActiveTrial } from "@/lib/premium/trial";
import { getVocabularyCards } from "@/lib/vocabulary/service";
import { getWeeklyPlan } from "@/lib/weekly-plan/service";
import { dailyGoalProgress, getDailyWorkload, getDashboardLifecycle } from "@/lib/workout/policy";
import { ApiV1Error } from "./errors";

function accuracy(value: ProgressCounts) {
  return { answered: value.attemptedCount, correct: value.correctCount, accuracy: value.accuracy };
}

export async function meProjection(userId: string) {
  const [[user], [profile], authMethods] = await Promise.all([
    db.select({ id: users.id, email: users.email, emailVerifiedAt: users.emailVerifiedAt }).from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(profiles).where(eq(profiles.id, userId)).limit(1),
    getUserAuthMethods(userId),
  ]);
  if (!user) throw new ApiV1Error(401, "UNAUTHENTICATED", "Your account is no longer available.");
  return { data: {
    id: user.id,
    email: user.email,
    emailVerified: Boolean(user.emailVerifiedAt),
    profile: {
      displayName: profile?.fullName ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
      interfaceLanguage: profile?.interfaceLanguage === "en" ? "en" as const : "vi" as const,
      explanationLanguage: profile?.explanationLanguage === "en" || profile?.explanationLanguage === "vi" ? profile.explanationLanguage : "both" as const,
      rankingVisibility: profile?.rankingVisibility === "PUBLIC" || profile?.rankingVisibility === "HIDDEN" ? profile.rankingVisibility : "ANONYMOUS" as const,
      learningEmailEnabled: profile?.learningEmailEnabled ?? false,
    },
    authMethods,
  } };
}

export async function dashboardProjection(userId: string) {
  const [dashboard, goal, usage] = await Promise.all([getDashboardData(userId), getLearnerGoal(userId), getUsageStatus(userId)]);
  const workload = getDailyWorkload({ goal, plan: usage.effectivePlan, workoutUsage: usage.entitlements.TODAYS_WORKOUT });
  const dailyGoal = dailyGoalProgress(dashboard.completedQuestionsToday, workload.targetQuestions);
  return { data: {
    progress: accuracy(dashboard.progress),
    completedQuestionsToday: dashboard.completedQuestionsToday,
    completedLearningSessions: dashboard.completedLearningSessions,
    unresolvedMistakes: dashboard.mistakes.unresolvedCount,
    recommendation: dashboard.recommendation ? {
      skillArea: dashboard.recommendation.skillArea,
      part: dashboard.recommendation.part,
      skill: dashboard.recommendation.primarySkill,
      subSkill: dashboard.recommendation.primarySubskill,
      reasonCode: dashboard.recommendation.reasonCode,
    } : null,
    resumablePractice: dashboard.resumablePractice ? { id: dashboard.resumablePractice.id, part: dashboard.resumablePractice.part, questionCount: dashboard.resumablePractice.questionCount } : null,
    goal: goal ? { targetScore: goal.targetScore, examDate: goal.examDate, dailyStudyMinutes: goal.dailyStudyMinutes, studyDaysPerWeek: goal.studyDaysPerWeek } : null,
    dailyGoal,
    lifecycle: getDashboardLifecycle({ recommendDiagnostic: dashboard.recommendDiagnostic, hasResumablePractice: Boolean(dashboard.resumablePractice), dailyGoalComplete: dailyGoal.complete, completedLearningSessions: dashboard.completedLearningSessions }),
  } };
}

export async function planProjection(userId: string) {
  const [dashboard, goal, usage] = await Promise.all([getDashboardData(userId), getLearnerGoal(userId), getUsageStatus(userId)]);
  const plan = await getWeeklyPlan(userId, goal, usage, dashboard);
  return { data: {
    weekStart: plan.weekStart,
    timezone: "Asia/Ho_Chi_Minh" as const,
    items: plan.preview.map((item) => ({ slot: item.slot, activity: item.activity, minutes: item.minutes, reason: item.reason, completed: item.completed, available: item.available })),
    adjustmentReasons: plan.adjustmentReasons,
    isPreview: usage.effectivePlan === "FREE",
  } };
}

export async function entitlementsProjection(userId: string) {
  const now = new Date();
  const [usage, capabilities, membership, trial] = await Promise.all([
    getUsageStatus(userId, now),
    getEffectiveCapabilities(userId, now),
    getMembershipState(userId, now),
    getActiveTrial(userId, now),
  ]);
  return { data: {
    effectivePlan: usage.effectivePlan,
    premiumExpiresAt: membership.expiresAt?.toISOString() ?? null,
    membershipStatus: membership.status,
    isTrial: Boolean(trial && membership.status === "ACTIVE" && membership.expiresAt?.getTime() === trial.endsAt?.getTime()),
    capabilities: {
      canUseAdvancedTargeting: capabilities.canUseAdvancedTargeting,
      canUseSmartMistakeReview: capabilities.canUseSmartMistakeReview,
      canUseAdvancedMockHistory: capabilities.canUseAdvancedMockHistory,
      canUseDiagnosticReassessment: capabilities.canUseDiagnosticReassessment,
      canUseSkillBreakdown: capabilities.canUseSkillBreakdown,
      historyWindowDays: capabilities.historyWindowDays,
    },
    usage: usage.entitlements,
  } };
}

export async function progressProjection(userId: string) {
  const progress = await getToeicProgress(userId);
  return { data: {
    overall: accuracy(progress),
    listening: accuracy(progress.listening),
    reading: accuracy(progress.reading),
    parts: progress.parts.map((part) => ({ part: part.part, summary: accuracy(part) })),
    latestAttemptAt: progress.latestAttemptAt,
  } };
}

type Cursor = { scope: string; key: string };
function encodeCursor(cursor: Cursor) { return Buffer.from(JSON.stringify(cursor)).toString("base64url"); }
function decodeCursor(value: string | undefined, scope: string) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Cursor;
    if (parsed.scope !== scope || typeof parsed.key !== "string") throw new Error();
    return parsed.key;
  } catch {
    throw new ApiV1Error(400, "VALIDATION_FAILED", "The pagination cursor is invalid.");
  }
}

export async function mistakesProjection(userId: string, cursor: string | undefined, limit: number) {
  const scope = `mistakes:${userId}:UNRESOLVED`;
  const after = decodeCursor(cursor, scope);
  const rows = await getMistakeBank(userId, "UNRESOLVED");
  const latestReasons = await getLatestReasonsForQuestions(userId, rows.map((row) => row.questionId));
  const keyed = rows.map((row) => ({ row, key: `${row.lastMissedAt.toISOString()}:${row.questionId}` }));
  const start = after ? Math.max(0, keyed.findIndex((item) => item.key === after) + 1) : 0;
  if (after && start === 0) throw new ApiV1Error(400, "VALIDATION_FAILED", "The pagination cursor is stale.");
  const page = keyed.slice(start, start + limit);
  return {
    data: page.map(({ row }) => ({ questionId: row.questionId, status: row.status, skillArea: row.skillArea, part: row.part, skill: row.skill, subSkill: row.subSkill, wrongCount: row.wrongCount, lastMissedAt: row.lastMissedAt.toISOString(), available: row.available, reasonCode: latestReasons.get(row.questionId) ?? null })),
    pagination: { hasMore: start + page.length < keyed.length, nextCursor: start + page.length < keyed.length && page.length ? encodeCursor({ scope, key: page.at(-1)!.key }) : null },
  };
}

export async function vocabularyProjection(userId: string, cursor: string | undefined, limit: number) {
  const scope = `vocabulary:${userId}`;
  const after = decodeCursor(cursor, scope);
  const rows = await getVocabularyCards(userId);
  const keyed = rows.map((row) => ({ row, key: `${row.dueAt.toISOString()}:${row.id}` }));
  const start = after ? Math.max(0, keyed.findIndex((item) => item.key === after) + 1) : 0;
  if (after && start === 0) throw new ApiV1Error(400, "VALIDATION_FAILED", "The pagination cursor is stale.");
  const page = keyed.slice(start, start + limit);
  return {
    data: page.map(({ row }) => ({ id: row.id, term: row.entry.term, meaningEn: row.entry.meaningEn, meaningVi: row.entry.meaningVi, contextSentence: row.contextSentence, toeicPart: row.toeicPart, dueAt: row.dueAt.toISOString(), intervalDays: row.intervalDays, correctStreak: row.correctStreak, reviewCount: row.reviewCount })),
    pagination: { hasMore: start + page.length < keyed.length, nextCursor: start + page.length < keyed.length && page.length ? encodeCursor({ scope, key: page.at(-1)!.key }) : null },
  };
}

function sessionQuestion(question: { id: string; number: number; part: number; text: string; skill: string; subSkill: string; passageSetId: string | null; options: Array<{ id: string; key: string; text: string }>; media?: Array<{ id: string; kind: "AUDIO" | "IMAGE"; url: string; alt: string }> }, selectedOptionId: string | null) {
  return { ...question, selectedOptionId };
}

export async function practiceProjection(userId: string, sessionId: string) {
  const session = await getPracticeSession(sessionId, { userId });
  if (session === null) throw new ApiV1Error(404, "NOT_FOUND", "Practice session not found.");
  if (session === "submitted") {
    const result = await getPracticeResult(sessionId, { userId });
    if (!result || result === "in_progress") throw new ApiV1Error(404, "NOT_FOUND", "Practice result not found.");
    return { data: {
      id: result.id,
      status: "submitted" as const,
      scoreCorrect: result.scoreCorrect,
      scoreTotal: result.scoreTotal,
      submittedAt: result.submittedAt,
      results: result.questions.map((question) => ({ questionId: question.id, number: question.number, part: question.part, text: question.text, options: question.options, selectedOptionId: question.selectedOptionId, correctOptionId: question.correctOptionId, isCorrect: question.isCorrect, explanationEn: question.explanationEn, explanationVi: question.explanationVi, ...(question.mistakeReason ? { mistakeReason: question.mistakeReason } : {}) })),
    } };
  }
  const drafts = await db.select({ questionId: practiceAnswerDrafts.questionId, selectedOptionId: practiceAnswerDrafts.selectedOptionId }).from(practiceAnswerDrafts)
    .where(and(eq(practiceAnswerDrafts.userId, userId), eq(practiceAnswerDrafts.sessionId, sessionId)));
  const selected = new Map(drafts.map((draft) => [draft.questionId, draft.selectedOptionId]));
  return { data: {
    id: session.id,
    status: "in_progress" as const,
    source: session.source,
    skillArea: session.skillArea,
    part: session.questions.length && session.questions.every((question) => question.part === session.questions[0].part) ? session.questions[0].part : null,
    questionCount: session.questionCount,
    questions: session.questions.map((question) => sessionQuestion(question, selected.get(question.id) ?? null)),
    groups: session.groups.map((group) => ({ id: group.id, part: group.part, setType: group.setType, title: group.title, questionIds: group.questions.map((question) => question.id), passages: group.passages })),
  } };
}
