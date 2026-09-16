import "server-only";
import { and, asc, desc, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, diagnosticRuns, practiceSessionQuestions, practiceSessions, questions } from "@/db/schema";
import { calculateToeicDiagnosis } from "@/lib/diagnosis/calculate";
import { loadRecommendedWorkout } from "@/lib/diagnosis/service";
import { getPracticeSession, type PracticeOwner } from "@/lib/practice/queries";
import { flattenUniqueQuestionIds, RECENT_CONTENT_SESSION_WINDOW, type ContentHistory, type SelectionUnit } from "@/lib/practice/selection";
import { loadUnits, selectListeningPractice } from "@/lib/practice/selector";
import { getToeicProgress } from "@/lib/progress/queries";
import { chooseDiverseUnits } from "./policy";
export { shouldRecommendDiagnostic } from "./policy";

export const DIAGNOSTIC_TTL_DAYS = 7;
export const DIAGNOSTIC_PARTS = [1, 2, 3, 4, 5, 6, 7] as const;

export type DiagnosticOwner = PracticeOwner;
type ChildDraft = { skillArea: "LISTENING" | "READING"; part: number; practiceType: string; questionIds: string[]; units: SelectionUnit[] };

function ownerWhere(owner: DiagnosticOwner) {
  return "userId" in owner ? eq(diagnosticRuns.userId, owner.userId!) : eq(diagnosticRuns.guestOwnerHash, owner.guestOwnerHash);
}
function ownerValues(owner: DiagnosticOwner) { return "userId" in owner ? { userId: owner.userId!, guestOwnerHash: null } : { userId: null, guestOwnerHash: owner.guestOwnerHash }; }

async function history(userId: string | undefined, ids: string[]): Promise<ContentHistory> {
  if (!userId || !ids.length) return { seenQuestionIds: new Set(), recentQuestionIds: new Set() };
  const recent = await db.select({ id: practiceSessions.id }).from(practiceSessions).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "submitted"))).orderBy(desc(practiceSessions.submittedAt)).limit(RECENT_CONTENT_SESSION_WINDOW);
  const rows = await db.select({ questionId: attemptAnswers.questionId, sessionId: attemptAnswers.sessionId }).from(attemptAnswers).where(and(eq(attemptAnswers.userId, userId), inArray(attemptAnswers.questionId, ids)));
  const recentIds = new Set(recent.map((row) => row.id));
  return { seenQuestionIds: new Set(rows.map((row) => row.questionId)), recentQuestionIds: new Set(rows.filter((row) => recentIds.has(row.sessionId)).map((row) => row.questionId)) };
}

async function readingDraft(part: 5 | 6 | 7, target: number, userId?: string): Promise<ChildDraft> {
  const units = await loadUnits(part); if (!units.length) throw new Error(`NOT_ENOUGH_READING_PART_${part}`);
  const ids = flattenUniqueQuestionIds(units); const taxonomy = await db.select({ id: questions.id, skill: questions.skill, subSkill: questions.subSkill }).from(questions).where(inArray(questions.id, ids));
  const tax = new Map(taxonomy.map((q) => [q.id, q])); const seen = await history(userId, ids);
  const enriched = units.map((unit) => ({ ...unit, skill: tax.get(unit.questionIds[0])?.skill ?? "", subSkill: tax.get(unit.questionIds[0])?.subSkill ?? "" }));
  const rank = (unit: typeof enriched[number]) => unit.questionIds.some((id) => seen.recentQuestionIds.has(id)) ? 2 : unit.questionIds.some((id) => seen.seenQuestionIds.has(id)) ? 1 : 0;
  enriched.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
  const selected = chooseDiverseUnits(enriched, target); const questionIds = flattenUniqueQuestionIds(selected);
  if (!questionIds.length) throw new Error(`NOT_ENOUGH_READING_PART_${part}`);
  return { skillArea: "READING", part, practiceType: `part_${part}`, questionIds, units: selected };
}

async function buildDrafts(userId?: string): Promise<ChildDraft[]> {
  const [p1, p2, p3, p4, p5, p6, p7] = await Promise.all([
    selectListeningPractice(1, 3, { userId, diverse: true }), selectListeningPractice(2, 3, { userId, diverse: true }),
    selectListeningPractice(3, 1, { userId, diverse: true }), selectListeningPractice(4, 1, { userId, diverse: true }),
    readingDraft(5, 6, userId), readingDraft(6, 4, userId), readingDraft(7, 7, userId),
  ]);
  const listening = [p1, p2, p3, p4].map((rows, index) => ({ skillArea: "LISTENING" as const, part: index + 1, practiceType: `listening_part_${index + 1}`, questionIds: rows.map((q) => q.id), units: rows.map((q) => ({ id: q.passageSetId!, part: index + 1, questionIds: [q.id] })) }));
  return [...listening, p5, p6, p7];
}

export async function getOrCreateDiagnostic(owner: DiagnosticOwner) {
  const now = new Date();
  await db.update(diagnosticRuns).set({ status: "EXPIRED" }).where(and(ownerWhere(owner), eq(diagnosticRuns.status, "IN_PROGRESS"), lt(diagnosticRuns.expiresAt, now)));
  const existing = (await db.select({ id: diagnosticRuns.id }).from(diagnosticRuns).where(and(ownerWhere(owner), eq(diagnosticRuns.status, "IN_PROGRESS"), gt(diagnosticRuns.expiresAt, now))).limit(1))[0];
  if (existing) return existing.id;
  const drafts = await buildDrafts("userId" in owner ? owner.userId : undefined);
  return db.transaction(async (tx) => {
    const lockKey = "userId" in owner ? owner.userId! : owner.guestOwnerHash;
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${lockKey}:diagnostic`}, 0))`);
    const active = (await tx.select({ id: diagnosticRuns.id }).from(diagnosticRuns).where(and(ownerWhere(owner), eq(diagnosticRuns.status, "IN_PROGRESS"), gt(diagnosticRuns.expiresAt, now))).limit(1))[0];
    if (active) return active.id;
    const expiresAt = new Date(now.getTime() + DIAGNOSTIC_TTL_DAYS * 86_400_000);
    const [run] = await tx.insert(diagnosticRuns).values({ ...ownerValues(owner), expiresAt }).returning({ id: diagnosticRuns.id });
    for (let index = 0; index < drafts.length; index++) {
      const draft = drafts[index];
      const [session] = await tx.insert(practiceSessions).values({ ...ownerValues(owner), skillArea: draft.skillArea, practiceType: draft.practiceType, part: draft.part, status: "in_progress", questionCount: draft.questionIds.length, requestedQuestionCount: draft.questionIds.length, source: "diagnostic", expiresAt, diagnosticRunId: run.id, diagnosticOrder: index + 1 }).returning({ id: practiceSessions.id });
      const setByQuestion = new Map(draft.units.flatMap((unit) => unit.questionIds.map((id) => [id, draft.part === 5 ? null : unit.id] as const)));
      await tx.insert(practiceSessionQuestions).values(draft.questionIds.map((questionId, order) => ({ sessionId: session.id, questionId, displayOrder: order + 1, passageSetId: setByQuestion.get(questionId) ?? null })));
    }
    return run.id;
  });
}

export async function getDiagnosticRun(runId: string, owner: DiagnosticOwner) {
  const run = (await db.select().from(diagnosticRuns).where(and(eq(diagnosticRuns.id, runId), ownerWhere(owner))).limit(1))[0]; if (!run) return null;
  if (run.status === "IN_PROGRESS" && run.expiresAt <= new Date()) { await db.update(diagnosticRuns).set({ status: "EXPIRED" }).where(and(eq(diagnosticRuns.id, run.id), eq(diagnosticRuns.status, "IN_PROGRESS"))); return { ...run, status: "EXPIRED" as const, children: [] }; }
  const children = await db.select().from(practiceSessions).where(eq(practiceSessions.diagnosticRunId, run.id)).orderBy(asc(practiceSessions.diagnosticOrder));
  const completed = children.reduce((sum, child) => sum + (child.status === "submitted" ? child.questionCount : 0), 0);
  return { ...run, children, totalQuestions: children.reduce((sum, child) => sum + child.questionCount, 0), completedQuestions: completed, current: children.find((child) => child.status === "in_progress") ?? null };
}

export async function getDiagnosticChild(runId: string, owner: DiagnosticOwner) {
  const run = await getDiagnosticRun(runId, owner); if (!run || run.status !== "IN_PROGRESS" || !run.current) return { run, session: null };
  return { run, session: await getPracticeSession(run.current.id, owner) };
}

export async function hasCompletedDiagnostic(userId: string) { return Boolean((await db.select({ id: diagnosticRuns.id }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, userId), eq(diagnosticRuns.status, "COMPLETED"))).limit(1))[0]); }

export async function getDiagnosticResult(runId: string, owner: DiagnosticOwner) {
  const run = await getDiagnosticRun(runId, owner); if (!run || run.status !== "COMPLETED") return null;
  if (!("userId" in owner)) return { run, progress: null, diagnosis: null, recommendation: null };
  const progress = await getToeicProgress(owner.userId!); const diagnosis = calculateToeicDiagnosis(progress); const recommendation = await loadRecommendedWorkout(owner.userId!).catch(() => null);
  return { run, progress, diagnosis, recommendation };
}

export async function diagnosticRunForSession(sessionId: string) {
  return (await db.select({ runId: practiceSessions.diagnosticRunId, status: diagnosticRuns.status }).from(practiceSessions).innerJoin(diagnosticRuns, eq(diagnosticRuns.id, practiceSessions.diagnosticRunId)).where(eq(practiceSessions.id, sessionId)).limit(1))[0] ?? null;
}
