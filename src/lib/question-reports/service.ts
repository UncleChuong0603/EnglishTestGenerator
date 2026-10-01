import "server-only";

import { and, asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  adminAuditLogs,
  attemptAnswers,
  fullMockFormQuestions,
  mediaAssets,
  passageSets,
  practiceSessionQuestions,
  practiceSessions,
  questionGroupMedia,
  questionOptions,
  questionReports,
  questionSolutions,
  questions,
  rankedChallengeItems,
  rankedChallenges,
  userRoles,
  users,
} from "@/db/schema";
import { cloneContent } from "@/lib/admin/content";
import {
  QUESTION_REPORT_DAILY_LIMIT,
  QUESTION_REPORT_DESCRIPTION_MAX,
  QUESTION_REPORT_HOURLY_LIMIT,
  QUESTION_REPORT_NOTE_MAX,
  QUESTION_REPORT_REASONS,
  QUESTION_REPORT_STATUSES,
  type QuestionReportReason,
  type QuestionReportStatus,
} from "./catalog";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type ReportActor = { userId: string; guestOwnerHash?: never } | { userId?: never; guestOwnerHash: string };

export class QuestionReportError extends Error {
  constructor(readonly code: "INVALID_INPUT" | "NOT_ALLOWED" | "DUPLICATE" | "RATE_LIMITED" | "NOT_FOUND" | "INVALID_TRANSITION" | "NOTE_REQUIRED" | "CORRECTION_NOT_PUBLISHED" | "ORIGINAL_STILL_PUBLISHED" | "EDITOR_UNAVAILABLE" | "ACCESS_DENIED") {
    super(code);
  }
}

export function cleanReportText(value: string, maxLength: number) {
  const cleaned = value.normalize("NFKC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, maxLength);
}

function actorCondition(actor: ReportActor) {
  return actor.userId
    ? eq(practiceSessions.userId, actor.userId)
    : eq(practiceSessions.guestOwnerHash, actor.guestOwnerHash!);
}

function reportActorCondition(actor: ReportActor) {
  return actor.userId
    ? eq(questionReports.reporterUserId, actor.userId)
    : eq(questionReports.guestOwnerHash, actor.guestOwnerHash!);
}

function reportSource(session: { source: string; diagnosticRunId: string | null; fullMockRunId: string | null; rankedChallengeRunId: string | null }) {
  if (session.diagnosticRunId || session.source === "diagnostic") return "DIAGNOSTIC";
  if (session.rankedChallengeRunId || session.source === "ranked_challenge") return "CHALLENGE";
  if (session.fullMockRunId || session.source === "full_mock") return "FULL_MOCK";
  if (session.source === "mastery_review") return "MISTAKE_REVIEW";
  return "PRACTICE";
}

export async function createQuestionReport(actor: ReportActor, input: { sessionId: string; questionId: string; reason: QuestionReportReason; description?: string }) {
  if (!QUESTION_REPORT_REASONS.includes(input.reason) || !/^[0-9a-f-]{36}$/i.test(input.sessionId) || !/^[0-9a-f-]{36}$/i.test(input.questionId) || (input.description ?? "").length > QUESTION_REPORT_DESCRIPTION_MAX) throw new QuestionReportError("INVALID_INPUT");
  const description = cleanReportText(input.description ?? "", QUESTION_REPORT_DESCRIPTION_MAX) || null;
  try {
    return await db.transaction(async (tx) => {
      const [allowed] = await tx.select({
        questionGroupId: questions.passageSetId,
        source: practiceSessions.source,
        diagnosticRunId: practiceSessions.diagnosticRunId,
        fullMockRunId: practiceSessions.fullMockRunId,
        rankedChallengeRunId: practiceSessions.rankedChallengeRunId,
      }).from(practiceSessions)
        .innerJoin(practiceSessionQuestions, eq(practiceSessionQuestions.sessionId, practiceSessions.id))
        .innerJoin(questions, eq(questions.id, practiceSessionQuestions.questionId))
        .where(and(
          eq(practiceSessions.id, input.sessionId),
          eq(practiceSessions.status, "submitted"),
          eq(practiceSessionQuestions.questionId, input.questionId),
          actorCondition(actor),
        )).limit(1);
      if (!allowed) throw new QuestionReportError("NOT_ALLOWED");

      const now = new Date();
      const [hour, day] = await Promise.all([
        tx.select({ value: count() }).from(questionReports).where(and(reportActorCondition(actor), gte(questionReports.createdAt, new Date(now.getTime() - 60 * 60 * 1000)))),
        tx.select({ value: count() }).from(questionReports).where(and(reportActorCondition(actor), gte(questionReports.createdAt, new Date(now.getTime() - 24 * 60 * 60 * 1000)))),
      ]);
      if (Number(hour[0]?.value ?? 0) >= QUESTION_REPORT_HOURLY_LIMIT || Number(day[0]?.value ?? 0) >= QUESTION_REPORT_DAILY_LIMIT) throw new QuestionReportError("RATE_LIMITED");

      const [created] = await tx.insert(questionReports).values({
        questionId: input.questionId,
        questionGroupId: allowed.questionGroupId,
        practiceSessionId: input.sessionId,
        reporterUserId: actor.userId ?? null,
        guestOwnerHash: actor.guestOwnerHash ?? null,
        sourceType: reportSource(allowed),
        reason: input.reason,
        description,
      }).returning({ id: questionReports.id });
      return created;
    });
  } catch (error) {
    if (error instanceof QuestionReportError) throw error;
    const databaseError = error as { code?: string; cause?: { code?: string } };
    if (databaseError.code === "23505" || databaseError.cause?.code === "23505") throw new QuestionReportError("DUPLICATE");
    throw error;
  }
}

async function assertAdmin(tx: Tx, actorUserId: string) {
  const roles = await tx.select({ role: userRoles.role }).from(userRoles)
    .innerJoin(users, eq(users.id, userRoles.userId))
    .where(and(eq(userRoles.userId, actorUserId), eq(users.status, "active"), sql`${userRoles.revokedAt} is null`));
  if (!roles.some((row) => row.role === "ADMIN")) throw new QuestionReportError("ACCESS_DENIED");
}

export type QuestionReportFilters = { part?: number; reason?: string; status?: string; page?: number };
const queuePageSize = 25;
const outerQuestionId = sql.raw('"question_reports"."question_id"');

export function questionReportPriority(openCount: number, reason: string) {
  if (openCount >= 3 || (openCount >= 2 && ["ANSWER_INCORRECT", "MEDIA_BROKEN"].includes(reason))) return "HIGH" as const;
  if (openCount >= 2 || ["ANSWER_INCORRECT", "MEDIA_BROKEN"].includes(reason)) return "MEDIUM" as const;
  return "NORMAL" as const;
}

export async function listQuestionReports(filters: QuestionReportFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const conditions = [];
  if (filters.part && filters.part >= 1 && filters.part <= 7) conditions.push(eq(questions.toeicPart, filters.part));
  if (filters.reason && QUESTION_REPORT_REASONS.includes(filters.reason as QuestionReportReason)) conditions.push(eq(questionReports.reason, filters.reason));
  if (filters.status && QUESTION_REPORT_STATUSES.includes(filters.status as QuestionReportStatus)) conditions.push(eq(questionReports.status, filters.status));
  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, total] = await Promise.all([
    db.select({
      id: questionReports.id,
      questionId: questionReports.questionId,
      questionText: questions.questionText,
      part: questions.toeicPart,
      groupId: questionReports.questionGroupId,
      groupTitle: passageSets.title,
      reason: questionReports.reason,
      status: questionReports.status,
      sourceType: questionReports.sourceType,
      createdAt: questionReports.createdAt,
      reportCount: sql<number>`(select count(*)::int from question_reports qr_total where qr_total.question_id = ${outerQuestionId})`,
      openCount: sql<number>`(select count(*)::int from question_reports qr_open where qr_open.question_id = ${outerQuestionId} and qr_open.status in ('OPEN','IN_REVIEW'))`,
    }).from(questionReports)
      .innerJoin(questions, eq(questions.id, questionReports.questionId))
      .leftJoin(passageSets, eq(passageSets.id, questionReports.questionGroupId))
      .where(where)
      .orderBy(sql`case ${questionReports.status} when 'OPEN' then 0 when 'IN_REVIEW' then 1 when 'RESOLVED' then 2 else 3 end`, desc(questionReports.createdAt), desc(questionReports.id))
      .limit(queuePageSize).offset((page - 1) * queuePageSize),
    db.select({ value: count() }).from(questionReports).innerJoin(questions, eq(questions.id, questionReports.questionId)).where(where),
  ]);
  return { rows: rows.map((row) => ({ ...row, reportCount: Number(row.reportCount), openCount: Number(row.openCount), priority: questionReportPriority(Number(row.openCount), row.reason) })), total: Number(total[0]?.value ?? 0), page, pageSize: queuePageSize };
}

export async function getQuestionReportDetail(questionId: string) {
  const [question] = await db.select({ question: questions, group: passageSets }).from(questions)
    .leftJoin(passageSets, eq(passageSets.id, questions.passageSetId))
    .where(eq(questions.id, questionId)).limit(1);
  if (!question) return null;
  const [options, solution, reports, attemptCount, mockCount, challengeCount, media] = await Promise.all([
    db.select().from(questionOptions).where(eq(questionOptions.questionId, questionId)).orderBy(asc(questionOptions.displayOrder)),
    db.select().from(questionSolutions).where(eq(questionSolutions.questionId, questionId)).limit(1),
    db.select().from(questionReports).where(eq(questionReports.questionId, questionId)).orderBy(desc(questionReports.createdAt)),
    db.select({ value: count() }).from(attemptAnswers).where(eq(attemptAnswers.questionId, questionId)),
    db.select({ value: count() }).from(fullMockFormQuestions).where(eq(fullMockFormQuestions.questionId, questionId)),
    db.select({ value: count() }).from(rankedChallengeItems).innerJoin(rankedChallenges, eq(rankedChallenges.id, rankedChallengeItems.challengeId)).where(and(eq(rankedChallengeItems.questionId, questionId), eq(rankedChallenges.status, "PUBLISHED"), sql`${rankedChallenges.endsAt} > now()`)),
    question.group ? db.select({ id: mediaAssets.id, kind: mediaAssets.kind, status: mediaAssets.status, role: questionGroupMedia.role }).from(questionGroupMedia).innerJoin(mediaAssets, eq(mediaAssets.id, questionGroupMedia.mediaAssetId)).where(eq(questionGroupMedia.questionGroupId, question.group.id)) : Promise.resolve([]),
  ]);
  const remediationIds = [...new Set(reports.flatMap((report) => report.remediationGroupId ? [report.remediationGroupId] : []))];
  const remediation = remediationIds.length ? await db.select({ id: passageSets.id, status: passageSets.status, title: passageSets.title }).from(passageSets).where(inArray(passageSets.id, remediationIds)) : [];
  const openCount = reports.filter((report) => report.status === "OPEN" || report.status === "IN_REVIEW").length;
  return {
    ...question,
    options,
    solution: solution[0] ?? null,
    reports: reports.map((report) => ({ ...report, remediation: remediation.find((item) => item.id === report.remediationGroupId) ?? null })),
    priority: questionReportPriority(openCount, reports[0]?.reason ?? "OTHER"),
    media,
    impact: { historicalAttempts: Number(attemptCount[0]?.value ?? 0), fullMockReferences: Number(mockCount[0]?.value ?? 0), activeChallengeReferences: Number(challengeCount[0]?.value ?? 0) },
  };
}

export async function updateQuestionReportStatus(actorUserId: string, input: { reportId: string; status: Exclude<QuestionReportStatus, "OPEN">; note?: string }) {
  if (!(["IN_REVIEW", "RESOLVED", "DISMISSED"] as readonly string[]).includes(input.status) || (input.note ?? "").length > QUESTION_REPORT_NOTE_MAX) throw new QuestionReportError("INVALID_INPUT");
  const note = cleanReportText(input.note ?? "", QUESTION_REPORT_NOTE_MAX);
  if ((input.status === "RESOLVED" || input.status === "DISMISSED") && !note) throw new QuestionReportError("NOTE_REQUIRED");
  return db.transaction(async (tx) => {
    await assertAdmin(tx, actorUserId);
    const [report] = await tx.select().from(questionReports).where(eq(questionReports.id, input.reportId)).for("update").limit(1);
    if (!report) throw new QuestionReportError("NOT_FOUND");
    if (!(["OPEN", "IN_REVIEW"] as string[]).includes(report.status)) throw new QuestionReportError("INVALID_TRANSITION");
    if (input.status === "RESOLVED" && report.remediationGroupId) {
      const [remediation] = await tx.select({ status: passageSets.status }).from(passageSets).where(eq(passageSets.id, report.remediationGroupId)).limit(1);
      if (!remediation || remediation.status !== "published") throw new QuestionReportError("CORRECTION_NOT_PUBLISHED");
      if (report.questionGroupId && report.questionGroupId !== report.remediationGroupId) {
        const [original] = await tx.select({ status: passageSets.status }).from(passageSets).where(eq(passageSets.id, report.questionGroupId)).limit(1);
        if (original?.status === "published") throw new QuestionReportError("ORIGINAL_STILL_PUBLISHED");
      }
    }
    const now = new Date();
    await tx.update(questionReports).set({
      status: input.status,
      resolutionNote: note || report.resolutionNote,
      reviewedBy: actorUserId,
      reviewedAt: report.reviewedAt ?? now,
      resolvedAt: input.status === "RESOLVED" || input.status === "DISMISSED" ? now : null,
      updatedAt: now,
    }).where(eq(questionReports.id, report.id));
    const action = input.status === "IN_REVIEW" ? "QUESTION_REPORT_REVIEW_STARTED" : input.status === "RESOLVED" ? "QUESTION_REPORT_RESOLVED" : "QUESTION_REPORT_DISMISSED";
    await tx.insert(adminAuditLogs).values({ actorUserId, action, metadata: { reportId: report.id, questionId: report.questionId, previousStatus: report.status, newStatus: input.status } });
  });
}

export async function prepareQuestionReportCorrection(actorUserId: string, reportId: string) {
  const report = await db.transaction(async (tx) => {
    await assertAdmin(tx, actorUserId);
    const [row] = await tx.select({ report: questionReports, order: questions.questionOrder }).from(questionReports)
      .innerJoin(questions, eq(questions.id, questionReports.questionId))
      .where(eq(questionReports.id, reportId)).limit(1);
    if (!row) throw new QuestionReportError("NOT_FOUND");
    if (!["OPEN", "IN_REVIEW"].includes(row.report.status)) throw new QuestionReportError("INVALID_TRANSITION");
    if (!row.report.questionGroupId) throw new QuestionReportError("EDITOR_UNAVAILABLE");
    return { ...row.report, questionOrder: row.order };
  });
  const groupId = report.remediationGroupId ?? await cloneContent(actorUserId, report.questionGroupId!);
  const [draftQuestion] = await db.select({ id: questions.id }).from(questions).where(and(eq(questions.passageSetId, groupId), eq(questions.questionOrder, report.questionOrder))).limit(1);
  if (!draftQuestion) throw new QuestionReportError("NOT_FOUND");
  await db.transaction(async (tx) => {
    await assertAdmin(tx, actorUserId);
    const now = new Date();
    await tx.update(questionReports).set({ status: "IN_REVIEW", remediationGroupId: groupId, reviewedBy: actorUserId, reviewedAt: now, updatedAt: now })
      .where(and(eq(questionReports.questionId, report.questionId), sql`${questionReports.status} in ('OPEN','IN_REVIEW')`));
    await tx.insert(adminAuditLogs).values({ actorUserId, action: "QUESTION_REPORT_CORRECTION_DRAFTED", metadata: { reportId, questionId: report.questionId, sourceGroupId: report.questionGroupId, remediationGroupId: groupId } });
  });
  return { groupId, questionId: draftQuestion.id };
}
