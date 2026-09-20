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
import { getEffectiveCapabilities } from "@/lib/entitlements/service";
import { chooseDiverseUnits, DIAGNOSTIC_BLUEPRINT_VERSION, nextDiagnosticEligibleAt, percentagePointDelta } from "./policy";
export { shouldRecommendDiagnostic } from "./policy";

export const DIAGNOSTIC_TTL_DAYS = 7;
export const DIAGNOSTIC_PARTS = [1, 2, 3, 4, 5, 6, 7] as const;

export type DiagnosticOwner = PracticeOwner;
export type DiagnosticEligibilityStatus = "NEEDS_BASELINE" | "ACTIVE" | "COOLDOWN" | "ELIGIBLE" | "FREE_NOT_ELIGIBLE";
export type DiagnosticEligibility = { status: DiagnosticEligibilityStatus; activeRunId: string | null; lastCompletedAt: Date | null; nextEligibleAt: Date | null; canUseDiagnosticReassessment: boolean };
export class DiagnosticEligibilityError extends Error {
  constructor(readonly code: "FREE_NOT_ELIGIBLE" | "COOLDOWN") { super(code); }
}

export async function getDiagnosticEligibility(userId: string, now = new Date()): Promise<DiagnosticEligibility> {
  const [active, latestAny, latest, capabilities] = await Promise.all([
    db.select({ id: diagnosticRuns.id }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, userId), eq(diagnosticRuns.status, "IN_PROGRESS"), gt(diagnosticRuns.expiresAt, now))).limit(1),
    db.select({ completedAt: diagnosticRuns.completedAt }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, userId), eq(diagnosticRuns.status, "COMPLETED"))).orderBy(desc(diagnosticRuns.completedAt)).limit(1),
    db.select({ completedAt: diagnosticRuns.completedAt }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, userId), eq(diagnosticRuns.status, "COMPLETED"), eq(diagnosticRuns.blueprintVersion, DIAGNOSTIC_BLUEPRINT_VERSION))).orderBy(desc(diagnosticRuns.completedAt)).limit(1),
    getEffectiveCapabilities(userId, now),
  ]);
  const hasBaseline = latestAny.length > 0;
  const lastCompletedAt = latest[0]?.completedAt ?? latestAny[0]?.completedAt ?? null;
  const compatibleCompletedAt = latest[0]?.completedAt ?? null;
  const nextEligibleAt = compatibleCompletedAt ? nextDiagnosticEligibleAt(compatibleCompletedAt) : null;
  const base = { activeRunId: active[0]?.id ?? null, lastCompletedAt, nextEligibleAt, canUseDiagnosticReassessment: capabilities.canUseDiagnosticReassessment };
  if (base.activeRunId) return { status: "ACTIVE", ...base };
  if (!hasBaseline) return { status: "NEEDS_BASELINE", ...base };
  if (!capabilities.canUseDiagnosticReassessment) return { status: "FREE_NOT_ELIGIBLE", ...base };
  if (nextEligibleAt && nextEligibleAt > now) return { status: "COOLDOWN", ...base };
  return { status: "ELIGIBLE", ...base };
}
export async function hasResumableDiagnostic(owner: DiagnosticOwner) {
  const active = await db.select({ id: diagnosticRuns.id }).from(diagnosticRuns)
    .where(and(ownerWhere(owner), eq(diagnosticRuns.status, "IN_PROGRESS"), gt(diagnosticRuns.expiresAt, new Date())))
    .limit(1);
  return active.length > 0;
}
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
    let purpose: "BASELINE" | "REASSESSMENT" = "BASELINE";
    if ("userId" in owner) {
      const [latestAny] = await tx.select({ completedAt: diagnosticRuns.completedAt }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, owner.userId!), eq(diagnosticRuns.status, "COMPLETED"))).orderBy(desc(diagnosticRuns.completedAt)).limit(1);
      const [latestCompatible] = await tx.select({ completedAt: diagnosticRuns.completedAt }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, owner.userId!), eq(diagnosticRuns.status, "COMPLETED"), eq(diagnosticRuns.blueprintVersion, DIAGNOSTIC_BLUEPRINT_VERSION))).orderBy(desc(diagnosticRuns.completedAt)).limit(1);
      if (latestAny?.completedAt) {
        const capabilities = await getEffectiveCapabilities(owner.userId!, now);
        if (!capabilities.canUseDiagnosticReassessment) throw new DiagnosticEligibilityError("FREE_NOT_ELIGIBLE");
        if (latestCompatible?.completedAt && nextDiagnosticEligibleAt(latestCompatible.completedAt) > now) throw new DiagnosticEligibilityError("COOLDOWN");
        purpose = "REASSESSMENT";
      }
    }
    const expiresAt = new Date(now.getTime() + DIAGNOSTIC_TTL_DAYS * 86_400_000);
    const [run] = await tx.insert(diagnosticRuns).values({ ...ownerValues(owner), expiresAt, purpose, blueprintVersion: DIAGNOSTIC_BLUEPRINT_VERSION }).returning({ id: diagnosticRuns.id });
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
  const [progress, capabilities] = await Promise.all([getToeicProgress(owner.userId!), getEffectiveCapabilities(owner.userId!)]); const diagnosis = calculateToeicDiagnosis(progress); const recommendation = await loadRecommendedWorkout(owner.userId!).catch(() => null);
  const history = capabilities.canUseDiagnosticReassessment ? await getDiagnosticHistory(owner.userId!, run.blueprintVersion) : [];
  const index = history.findIndex((item) => item.id === run.id);
  const previous = index >= 0 ? history[index + 1] ?? null : null;
  return { run, progress, diagnosis, recommendation, summary: history[index] ?? summarizeRun({ ...run, completedAt: run.completedAt!, children: run.children }), previous, history };
}

export type DiagnosticMetric = { correct: number; total: number; accuracy: number | null };
export type DiagnosticSummary = { id: string; completedAt: Date; blueprintVersion: string | null; purpose: string; overall: DiagnosticMetric; listening: DiagnosticMetric; reading: DiagnosticMetric; parts: Array<DiagnosticMetric & { part: number }> };
const metric = (correct: number, total: number): DiagnosticMetric => ({ correct, total, accuracy: total ? Math.round(correct / total * 100) : null });
function summarizeRun(run: { id: string; completedAt: Date; blueprintVersion: string | null; purpose: string; children: Array<typeof practiceSessions.$inferSelect> }): DiagnosticSummary {
  const rows = run.children; const forRows = (items: typeof rows) => metric(items.reduce((n, row) => n + (row.scoreCorrect ?? 0), 0), items.reduce((n, row) => n + (row.scoreTotal ?? 0), 0));
  return { id: run.id, completedAt: run.completedAt, blueprintVersion: run.blueprintVersion, purpose: run.purpose, overall: forRows(rows), listening: forRows(rows.filter((row) => row.skillArea === "LISTENING")), reading: forRows(rows.filter((row) => row.skillArea === "READING")), parts: DIAGNOSTIC_PARTS.map((part) => ({ part, ...forRows(rows.filter((row) => row.part === part)) })) };
}

export async function getDiagnosticHistory(userId: string, blueprintVersion: string | null = DIAGNOSTIC_BLUEPRINT_VERSION): Promise<DiagnosticSummary[]> {
  if (!blueprintVersion) return [];
  const runs = await db.select({ id: diagnosticRuns.id, completedAt: diagnosticRuns.completedAt, blueprintVersion: diagnosticRuns.blueprintVersion, purpose: diagnosticRuns.purpose }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, userId), eq(diagnosticRuns.status, "COMPLETED"), eq(diagnosticRuns.blueprintVersion, blueprintVersion))).orderBy(desc(diagnosticRuns.completedAt));
  if (!runs.length) return [];
  const children = await db.select().from(practiceSessions).where(inArray(practiceSessions.diagnosticRunId, runs.map((run) => run.id)));
  return runs.map((run) => summarizeRun({ ...run, completedAt: run.completedAt!, blueprintVersion: run.blueprintVersion!, children: children.filter((child) => child.diagnosticRunId === run.id) }));
}

export function compareDiagnosticSummaries(latest: DiagnosticSummary, previous: DiagnosticSummary) {
  const delta = (a: DiagnosticMetric, b: DiagnosticMetric) => percentagePointDelta(b.correct, b.total, a.correct, a.total);
  return { overallDelta: delta(latest.overall, previous.overall), listeningDelta: delta(latest.listening, previous.listening), readingDelta: delta(latest.reading, previous.reading), parts: latest.parts.map((part) => ({ part: part.part, delta: delta(part, previous.parts.find((item) => item.part === part.part) ?? metric(0, 0)) })) };
}

export async function diagnosticRunForSession(sessionId: string) {
  return (await db.select({ runId: practiceSessions.diagnosticRunId, status: diagnosticRuns.status }).from(practiceSessions).innerJoin(diagnosticRuns, eq(diagnosticRuns.id, practiceSessions.diagnosticRunId)).where(eq(practiceSessions.id, sessionId)).limit(1))[0] ?? null;
}
