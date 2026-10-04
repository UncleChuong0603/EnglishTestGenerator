import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { listeningLessons, practiceSessions, questionSolutions, questions, remediationSessionContexts } from "@/db/schema";
import type { MistakeReasonCode } from "@/lib/mistake-reasons/catalog";
import { buildMicroLesson, type RemediationLessonKind } from "./content";

export async function getRemediationContext(userId: string, sessionId: string) {
  const [row] = await db.select({
    sourceQuestionId: remediationSessionContexts.sourceQuestionId,
    reasonCode: remediationSessionContexts.reasonCode,
    lessonKind: remediationSessionContexts.lessonKind,
    lessonRef: remediationSessionContexts.lessonRef,
    part: questions.toeicPart,
    skill: questions.skill,
    subSkill: questions.subSkill,
    explanationEn: questionSolutions.explanationEn,
    explanationVi: questionSolutions.explanationVi,
  }).from(remediationSessionContexts)
    .innerJoin(questions, eq(questions.id, remediationSessionContexts.sourceQuestionId))
    .innerJoin(questionSolutions, eq(questionSolutions.questionId, questions.id))
    .where(and(eq(remediationSessionContexts.userId, userId), eq(remediationSessionContexts.sessionId, sessionId)))
    .limit(1);
  if (!row) return null;
  const listeningLesson = row.lessonKind === "LISTENING_LESSON" && row.lessonRef
    ? (await db.select({ id: listeningLessons.id, title: listeningLessons.title, description: listeningLessons.description })
      .from(listeningLessons).where(and(eq(listeningLessons.id, row.lessonRef), eq(listeningLessons.status, "PUBLISHED"))).limit(1))[0] ?? null
    : null;
  return {
    sourceQuestionId: row.sourceQuestionId,
    reasonCode: row.reasonCode as MistakeReasonCode,
    microLesson: buildMicroLesson({
      ...row,
      reasonCode: row.reasonCode as MistakeReasonCode,
      lessonKind: row.lessonKind as RemediationLessonKind,
      listeningLesson,
    }),
  };
}

export async function getLatestRemediationTraces(userId: string, questionIds: string[]) {
  if (!questionIds.length) return new Map<string, { sessionId: string; status: string; reasonCode: MistakeReasonCode; lessonKind: RemediationLessonKind }>();
  const rows = await db.select({
    sourceQuestionId: remediationSessionContexts.sourceQuestionId,
    sessionId: remediationSessionContexts.sessionId,
    status: practiceSessions.status,
    reasonCode: remediationSessionContexts.reasonCode,
    lessonKind: remediationSessionContexts.lessonKind,
  }).from(remediationSessionContexts)
    .innerJoin(practiceSessions, eq(practiceSessions.id, remediationSessionContexts.sessionId))
    .where(and(eq(remediationSessionContexts.userId, userId), inArray(remediationSessionContexts.sourceQuestionId, questionIds)))
    .orderBy(desc(remediationSessionContexts.createdAt));
  const traces = new Map<string, { sessionId: string; status: string; reasonCode: MistakeReasonCode; lessonKind: RemediationLessonKind }>();
  for (const row of rows) if (!traces.has(row.sourceQuestionId)) traces.set(row.sourceQuestionId, {
    sessionId: row.sessionId,
    status: row.status,
    reasonCode: row.reasonCode as MistakeReasonCode,
    lessonKind: row.lessonKind as RemediationLessonKind,
  });
  return traces;
}
