import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, diagnosticRuns, fullMockRuns, practiceSessionQuestions, practiceSessions, questionMastery, questions } from "@/db/schema";
import { compareReviewPriority, type PriorityEvidence } from "./priority";

export type MistakeStatus = "UNRESOLVED" | "MASTERED";
export type MistakeListItem = { questionId: string; status: MistakeStatus; skillArea: "LISTENING" | "READING"; part: number; skill: string; subSkill: string; firstMissedAt: Date; lastMissedAt: Date; lastReviewedAt: Date | null; reviewAttemptCount: number; reviewSuccessStreak: number; masteredAt: Date | null; available: boolean; wrongCount: number };

const visibleEvidence = sql`exists (
  select 1 from ${attemptAnswers} aa
  join ${practiceSessions} ps on ps.id = aa.session_id
  left join ${diagnosticRuns} dr on dr.id = ps.diagnostic_run_id
  left join ${fullMockRuns} fmr on fmr.id = ps.full_mock_run_id
  where aa.user_id = ${questionMastery.userId} and aa.question_id = ${questionMastery.questionId}
    and aa.is_correct = false and ps.status = 'submitted'
    and (ps.source <> 'diagnostic' or dr.status = 'COMPLETED')
    and (ps.source <> 'full_mock' or fmr.status = 'COMPLETED')
)`;
const reviewableContent = sql`(
  ${questions.status} = 'published'
  and exists (select 1 from question_solutions qs where qs.question_id = ${questions.id})
  and (select count(*) from question_options qo where qo.question_id = ${questions.id}) = case when ${questions.toeicPart} = 2 then 3 else 4 end
  and (${questions.toeicPart} = 5 or exists (select 1 from passage_sets pset where pset.id = ${questions.passageSetId} and pset.status = 'published'))
  and (${questions.toeicPart} not between 1 and 4 or exists (
    select 1 from question_group_media qgm join media_assets ma on ma.id = qgm.media_asset_id
    where qgm.question_group_id = ${questions.passageSetId} and qgm.role = 'AUDIO' and ma.status = 'READY' and ma.access_scope = 'CONTENT'
  ))
  and (${questions.toeicPart} <> 1 or exists (
    select 1 from question_group_media qgm join media_assets ma on ma.id = qgm.media_asset_id
    where qgm.question_group_id = ${questions.passageSetId} and qgm.role = 'IMAGE' and ma.status = 'READY' and ma.access_scope = 'CONTENT'
  ))
  and (${questions.toeicPart} not in (3,4) or exists (select 1 from listening_transcripts lt where lt.question_group_id = ${questions.passageSetId} and length(lt.content) > 0))
  and (${questions.toeicPart} not in (6,7) or exists (select 1 from passages p where p.passage_set_id = ${questions.passageSetId} and p.status = 'published' and p.content is not null))
)`;
const wrongCount = sql<number>`(select count(*)::int from ${attemptAnswers} wrong
  join ${practiceSessions} session on session.id = wrong.session_id
  left join ${diagnosticRuns} diagnostic on diagnostic.id = session.diagnostic_run_id
  left join ${fullMockRuns} mock on mock.id = session.full_mock_run_id
  where wrong.user_id = ${questionMastery.userId} and wrong.question_id = ${questionMastery.questionId}
    and wrong.is_correct = false and session.status = 'submitted'
    and (session.source <> 'diagnostic' or diagnostic.status = 'COMPLETED')
    and (session.source <> 'full_mock' or mock.status = 'COMPLETED'))`;

export async function getMistakeBank(userId: string, status: MistakeStatus, filters?: { skillArea?: "LISTENING" | "READING"; part?: number }) {
  const conditions = [eq(questionMastery.userId, userId), eq(questionMastery.status, status), visibleEvidence];
  if (filters?.skillArea) conditions.push(eq(questions.skillArea, filters.skillArea));
  if (filters?.part) conditions.push(eq(questions.toeicPart, filters.part));
  const rows = await db.select({ questionId: questionMastery.questionId, status: questionMastery.status, skillArea: questions.skillArea, part: questions.toeicPart, skill: questions.skill, subSkill: questions.subSkill, firstMissedAt: questionMastery.firstMissedAt, lastMissedAt: questionMastery.lastMissedAt, lastReviewedAt: questionMastery.lastReviewedAt, reviewAttemptCount: questionMastery.reviewAttemptCount, reviewSuccessStreak: questionMastery.reviewSuccessStreak, masteredAt: questionMastery.masteredAt, available: sql<boolean>`${reviewableContent}`, wrongCount })
    .from(questionMastery).innerJoin(questions, eq(questions.id, questionMastery.questionId)).where(and(...conditions))
    .orderBy(status === "UNRESOLVED" ? asc(questionMastery.lastReviewedAt) : desc(questionMastery.masteredAt), asc(questionMastery.lastMissedAt));
  return rows.map((row) => ({ ...row, status: row.status as MistakeStatus, skillArea: row.skillArea as "LISTENING" | "READING", available: row.available, wrongCount: Number(row.wrongCount) })) satisfies MistakeListItem[];
}

export async function getMistakeCounts(userId: string) {
  const rows = await db.select({ status: questionMastery.status, count: sql<number>`count(*)::int` }).from(questionMastery).innerJoin(questions, eq(questions.id, questionMastery.questionId)).where(and(eq(questionMastery.userId, userId), visibleEvidence)).groupBy(questionMastery.status);
  return { unresolved: rows.find((r) => r.status === "UNRESOLVED")?.count ?? 0, mastered: rows.find((r) => r.status === "MASTERED")?.count ?? 0 };
}

export type MistakeOverview = {
  unresolvedCount: number;
  masteredCount: number;
  reviewableCount: number;
  repeatedMistakeCount: number;
};

/** A single aggregate for dashboard/result CTAs; never exposes attempt history. */
export async function getMistakeOverview(userId: string): Promise<MistakeOverview> {
  const [row] = await db.select({
    unresolvedCount: sql<number>`count(*) filter (where ${questionMastery.status} = 'UNRESOLVED')::int`,
    masteredCount: sql<number>`count(*) filter (where ${questionMastery.status} = 'MASTERED')::int`,
    reviewableCount: sql<number>`count(*) filter (where ${questionMastery.status} = 'UNRESOLVED' and ${reviewableContent})::int`,
    repeatedMistakeCount: sql<number>`count(*) filter (where ${questionMastery.status} = 'UNRESOLVED' and ${wrongCount} >= 2)::int`,
  }).from(questionMastery).innerJoin(questions, eq(questions.id, questionMastery.questionId))
    .where(and(eq(questionMastery.userId, userId), visibleEvidence));
  return {
    unresolvedCount: Number(row?.unresolvedCount ?? 0),
    masteredCount: Number(row?.masteredCount ?? 0),
    reviewableCount: Number(row?.reviewableCount ?? 0),
    repeatedMistakeCount: Number(row?.repeatedMistakeCount ?? 0),
  };
}

export async function getReviewCandidates(userId: string, part?: number) {
  const conditions = [eq(questionMastery.userId, userId), eq(questionMastery.status, "UNRESOLVED"), visibleEvidence, reviewableContent];
  if (part) conditions.push(eq(questions.toeicPart, part));
  return db.select({ questionId: questions.id, part: questions.toeicPart, skillArea: questions.skillArea, passageSetId: questions.passageSetId, lastReviewedAt: questionMastery.lastReviewedAt, lastMissedAt: questionMastery.lastMissedAt, streak: questionMastery.reviewSuccessStreak, attempts: questionMastery.reviewAttemptCount, wrongCount })
    .from(questionMastery).innerJoin(questions, eq(questions.id, questionMastery.questionId)).where(and(...conditions))
    .orderBy(asc(questionMastery.lastReviewedAt), asc(questionMastery.lastMissedAt), desc(questionMastery.reviewAttemptCount), asc(questionMastery.reviewSuccessStreak));
}

export async function getSmartReviewCandidates(userId: string, part?: number) {
  const candidates = await getReviewCandidates(userId, part);
  return candidates.sort((a, b) => compareReviewPriority(
    { questionId: a.questionId, wrongCount: Number(a.wrongCount), lastMissedAt: a.lastMissedAt, lastReviewedAt: a.lastReviewedAt, reviewSuccessStreak: a.streak } satisfies PriorityEvidence,
    { questionId: b.questionId, wrongCount: Number(b.wrongCount), lastMissedAt: b.lastMissedAt, lastReviewedAt: b.lastReviewedAt, reviewSuccessStreak: b.streak } satisfies PriorityEvidence,
  ));
}

export async function expandReviewGroups(seedIds: string[], part: number) {
  if (!seedIds.length) return [];
  const seed = await db.select({ id: questions.id, setId: questions.passageSetId }).from(questions).where(inArray(questions.id, seedIds));
  if (![3, 4, 6, 7].includes(part)) return seed.map((row) => ({ id: row.id, passageSetId: part <= 2 ? row.setId : null }));
  const setIds = [...new Set(seed.map((row) => row.setId).filter((id): id is string => Boolean(id)))];
  if (!setIds.length) return [];
  return db.select({ id: questions.id, passageSetId: questions.passageSetId }).from(questions).where(and(inArray(questions.passageSetId, setIds), eq(questions.status, "published"))).orderBy(asc(questions.questionOrder));
}

export async function getMasteryReviewSummary(sessionId: string, userId: string) {
  const [session] = await db.select({ source: practiceSessions.source, startedAt: practiceSessions.startedAt }).from(practiceSessions).where(and(eq(practiceSessions.id, sessionId), eq(practiceSessions.userId, userId))).limit(1);
  if (!session || session.source !== "mastery_review") return null;
  const assigned = await db.select({ questionId: practiceSessionQuestions.questionId }).from(practiceSessionQuestions).where(eq(practiceSessionQuestions.sessionId, sessionId));
  const ids = assigned.map((row) => row.questionId); if (!ids.length) return null;
  const rows = await db.select({ status: questionMastery.status, masteredAt: questionMastery.masteredAt }).from(questionMastery).where(and(eq(questionMastery.userId, userId), inArray(questionMastery.questionId, ids)));
  const overview = await getMistakeOverview(userId);
  return {
    trackedItems: rows.length,
    answeredQuestions: ids.length,
    masteredThisSession: rows.filter((row) => row.status === "MASTERED" && row.masteredAt && row.masteredAt >= session.startedAt).length,
    stillToReview: rows.filter((row) => row.status === "UNRESOLVED").length,
    remainingReviewable: overview.reviewableCount,
    unresolvedTotal: overview.unresolvedCount,
  };
}
