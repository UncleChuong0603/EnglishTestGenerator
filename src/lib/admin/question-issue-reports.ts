import "server-only";

import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs, passageSets, questionDuplicateScans, questionIssueReports, userRoles, users } from "@/db/schema";
import { findSimilarContent, type SimilarContentItem } from "@/lib/admin/content";
import { getQuestionBankSettings } from "@/lib/admin/question-bank-settings";
import { sha256 } from "@/lib/question-import/schema";

export const QUESTION_REPORT_STATUSES = ["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"] as const;
export const QUESTION_REPORT_TYPES = ["DUPLICATE", "CONTENT_ERROR", "ANSWER_ERROR", "MEDIA_ERROR", "OTHER"] as const;
export type QuestionReportStatus = (typeof QUESTION_REPORT_STATUSES)[number];
export type QuestionReportType = (typeof QUESTION_REPORT_TYPES)[number];

export function duplicateReportFingerprint(leftId: string, rightId: string) {
  return sha256(`DUPLICATE:${[leftId, rightId].sort().join(":")}`);
}

export async function syncDuplicateQuestionReports(part: number) {
  if (!Number.isInteger(part) || part < 1 || part > 7) throw new Error("INVALID_PART");
  return db.transaction(async (tx) => {
    // Serialize scans of the same Part across processes. Persist reports and the scan
    // version together, so a failed scan cannot close existing admin work.
    await tx.execute(sql`select pg_advisory_xact_lock(47310, ${part})`);
    const settings = await getQuestionBankSettings(tx);
    const [previousScan] = await tx.select().from(questionDuplicateScans).where(eq(questionDuplicateScans.toeicPart, part)).limit(1);
    const result = await findSimilarContent(part, {
      activeOnly: true,
      threshold: settings.similarityThresholdPercent / 100,
      contentVersion: previousScan?.contentVersion,
    }, tx);
    if (result.unchanged && previousScan) return { detected: previousScan.detectedCount, scanned: previousScan.scannedCount, thresholdPercent: previousScan.thresholdPercent, scannedAt: previousScan.scannedAt };
    const now = new Date();
    const detected = result.pairs.map((pair) => ({
      fingerprint: duplicateReportFingerprint(pair.left.id, pair.right.id),
      source: "SYSTEM",
      issueType: "DUPLICATE",
      status: "OPEN",
      toeicPart: part,
      primaryGroupId: [pair.left.id, pair.right.id].sort()[0],
      relatedGroupId: [pair.left.id, pair.right.id].sort()[1],
      confidencePercent: Math.round(pair.score * 100),
      evidence: {
        exact: pair.exact,
        sharedTerms: pair.sharedTerms,
        thresholdPercent: settings.similarityThresholdPercent,
        autoResolved: false,
      },
      detectedAt: now,
      lastDetectedAt: now,
      createdAt: now,
      updatedAt: now,
    }));

    const batchSize = 500;
    for (let offset = 0; offset < detected.length; offset += batchSize) {
      await tx.insert(questionIssueReports).values(detected.slice(offset, offset + batchSize)).onConflictDoUpdate({
        target: questionIssueReports.fingerprint,
        set: {
          confidencePercent: sql`excluded.confidence_percent`,
          evidence: sql`excluded.evidence`,
          lastDetectedAt: now,
          status: sql`case when ${questionIssueReports.status} = 'RESOLVED' and ${questionIssueReports.evidence}->>'autoResolved' = 'true' then 'OPEN' else ${questionIssueReports.status} end`,
          resolvedAt: sql`case when ${questionIssueReports.status} = 'RESOLVED' and ${questionIssueReports.evidence}->>'autoResolved' = 'true' then null else ${questionIssueReports.resolvedAt} end`,
          updatedAt: now,
        },
      });
    }

    await tx.update(questionIssueReports).set({
      resolvedAt: now, resolvedBy: null, status: "RESOLVED", updatedAt: now,
      evidence: sql`${questionIssueReports.evidence} || '{"autoResolved":true}'::jsonb`,
    }).where(and(
      eq(questionIssueReports.source, "SYSTEM"),
      eq(questionIssueReports.issueType, "DUPLICATE"),
      eq(questionIssueReports.toeicPart, part),
      or(eq(questionIssueReports.status, "OPEN"), eq(questionIssueReports.status, "IN_REVIEW")),
      sql`not (${questionIssueReports.fingerprint} = any(${sql.param(detected.map((report) => report.fingerprint))}::text[]))`,
    ));

    await tx.insert(questionDuplicateScans).values({
      toeicPart: part, contentVersion: result.contentVersion, scannedCount: result.scanned,
      detectedCount: detected.length, thresholdPercent: settings.similarityThresholdPercent, scannedAt: now,
    }).onConflictDoUpdate({ target: questionDuplicateScans.toeicPart, set: {
      contentVersion: result.contentVersion, scannedCount: result.scanned, detectedCount: detected.length,
      thresholdPercent: settings.similarityThresholdPercent, scannedAt: now,
    }});
    return { detected: detected.length, scanned: result.scanned, thresholdPercent: settings.similarityThresholdPercent, scannedAt: now };
  });
}

export type QuestionIssueReportRow = {
  id: string;
  source: string;
  issueType: QuestionReportType;
  status: QuestionReportStatus;
  part: number;
  confidencePercent: number | null;
  evidence: Record<string, unknown>;
  detectedAt: Date;
  lastDetectedAt: Date;
  primary: SimilarContentItem;
  related: SimilarContentItem | null;
};

export const QUESTION_REPORT_PAGE_SIZE = 20;

export async function listQuestionIssueReports(filters: { part?: number; status?: QuestionReportStatus; issueType?: QuestionReportType; page?: number }) {
  const page = Number.isSafeInteger(filters.page) && (filters.page ?? 0) > 0 ? filters.page! : 1;
  const conditions = [
    filters.part ? eq(questionIssueReports.toeicPart, filters.part) : undefined,
    filters.status ? eq(questionIssueReports.status, filters.status) : undefined,
    filters.issueType ? eq(questionIssueReports.issueType, filters.issueType) : undefined,
  ];
  const where = and(...conditions);
  const [reports, countRows] = await Promise.all([
    db.select().from(questionIssueReports).where(where)
      .orderBy(desc(questionIssueReports.confidencePercent), desc(questionIssueReports.lastDetectedAt), asc(questionIssueReports.id))
      .limit(QUESTION_REPORT_PAGE_SIZE).offset((page - 1) * QUESTION_REPORT_PAGE_SIZE),
    db.select({ status: questionIssueReports.status, value: sql<number>`count(*)::int` })
      .from(questionIssueReports)
      .where(and(
        filters.part ? eq(questionIssueReports.toeicPart, filters.part) : undefined,
        filters.issueType ? eq(questionIssueReports.issueType, filters.issueType) : undefined,
      ))
      .groupBy(questionIssueReports.status),
  ]);
  const groupIds = [...new Set(reports.flatMap((report) => [report.primaryGroupId, report.relatedGroupId]).filter((id): id is string => Boolean(id)))];
  const outerGroupId = sql.raw('"passage_sets"."id"');
  const groups = groupIds.length ? await db.select({
    id: passageSets.id,
    title: passageSets.title,
    lifecycle: passageSets.status,
    provenance: passageSets.provenance,
    createdAt: passageSets.createdAt,
    updatedAt: passageSets.updatedAt,
    questionCount: sql<number>`(select count(*)::int from questions q where q.passage_set_id=${outerGroupId})`,
    preview: sql<string>`coalesce((select q.question_text from questions q where q.passage_set_id=${outerGroupId} order by q.question_order limit 1),'')`,
  }).from(passageSets).where(inArray(passageSets.id, groupIds)) : [];
  const groupMap = new Map(groups.map((group) => [group.id, { ...group, lifecycle: group.lifecycle as SimilarContentItem["lifecycle"] } satisfies SimilarContentItem]));
  const rows = reports.flatMap((report): QuestionIssueReportRow[] => {
    const primary = groupMap.get(report.primaryGroupId);
    if (!primary) return [];
    return [{
      id: report.id,
      source: report.source,
      issueType: report.issueType as QuestionReportType,
      status: report.status as QuestionReportStatus,
      part: report.toeicPart,
      confidencePercent: report.confidencePercent,
      evidence: report.evidence,
      detectedAt: report.detectedAt,
      lastDetectedAt: report.lastDetectedAt,
      primary,
      related: report.relatedGroupId ? groupMap.get(report.relatedGroupId) ?? null : null,
    }];
  });
  return {
    rows,
    page,
    pageSize: QUESTION_REPORT_PAGE_SIZE,
    total: filters.status ? Number(countRows.find((row) => row.status === filters.status)?.value ?? 0) : countRows.reduce((sum, row) => sum + Number(row.value), 0),
    counts: Object.fromEntries(QUESTION_REPORT_STATUSES.map((status) => [status, Number(countRows.find((row) => row.status === status)?.value ?? 0)])) as Record<QuestionReportStatus, number>,
  };
}

export async function updateQuestionIssueReportStatus(actorUserId: string, id: string, status: QuestionReportStatus, expectedStatus?: QuestionReportStatus) {
  if (!QUESTION_REPORT_STATUSES.includes(status)) throw new Error("INVALID_STATUS");
  const now = new Date();
  return db.transaction(async (tx) => {
    const roles = await tx.select({ role: userRoles.role }).from(userRoles).innerJoin(users, eq(users.id, userRoles.userId))
      .where(and(eq(userRoles.userId, actorUserId), eq(users.status, "active"), sql`${userRoles.revokedAt} is null`));
    if (!roles.some((row) => row.role === "ADMIN")) throw new Error("ACCESS_DENIED");
    const [current] = await tx.select({ id: questionIssueReports.id, status: questionIssueReports.status })
      .from(questionIssueReports).where(eq(questionIssueReports.id, id)).for("update").limit(1);
    if (!current) throw new Error("NOT_FOUND");
    if (expectedStatus && current.status !== expectedStatus) throw new Error("STALE_REPORT");
    if (current.status === status) return;
    await tx.update(questionIssueReports).set({
      status,
      resolvedAt: status === "RESOLVED" || status === "DISMISSED" ? now : null,
      resolvedBy: status === "RESOLVED" || status === "DISMISSED" ? actorUserId : null,
      updatedAt: now,
      evidence: sql`${questionIssueReports.evidence} || '{"autoResolved":false}'::jsonb`,
    }).where(eq(questionIssueReports.id, id));
    await tx.insert(adminAuditLogs).values({
      actorUserId,
      action: "QUESTION_REPORT_STATUS_UPDATED",
      metadata: { reportId: id, previousStatus: current.status, newStatus: status },
    });
  });
}
