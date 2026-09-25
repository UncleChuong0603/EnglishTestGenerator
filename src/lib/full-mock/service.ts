import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, fullMockAnswers, fullMockFormQuestions, fullMockRuns, passageSets, practiceSessionQuestions, practiceSessions, questionOptions, questionSolutions, questions } from "@/db/schema";
import { consumeUsage } from "@/lib/entitlements/service";
import { awardCompletedLearning } from "@/lib/gamification/award";
import { reconcileMasteryAnswers } from "@/lib/mastery/persistence";
import { getSafeSessionContent } from "@/lib/practice/queries";
import { loadUnits, selectListeningPractice, type QuestionBankPool } from "@/lib/practice/selector";
import { assembleFullMock, assembleListeningMock, assembleReadingMock, deadlineFrom, type MockForm, type MockMode, type MockUnit } from "./blueprint";
import type { MockHistoryEntry } from "./history";
import { getEffectiveCapabilities } from "@/lib/entitlements/service";

export type MockReadiness = { ready: boolean; form?: MockForm };
export type MockHubReadiness = {
  listening: MockReadiness & { coverage: { p1: number; p2: number; p3Groups: number; p4Groups: number } };
  reading: MockReadiness & { coverage: { p5: number; p6Groups: number; p6Questions: number; p7SingleGroups: number; p7SingleQuestions: number; p7MultipleGroups: number; p7MultipleQuestions: number } };
  full: MockReadiness;
};

async function listeningUnits(part: 1 | 2 | 3 | 4, groups: number, pool: QuestionBankPool): Promise<MockUnit[]> {
  for (let target = groups; target >= 1; target--) try {
    const rows = await selectListeningPractice(part, target, undefined, false, pool); const grouped = new Map<string, typeof rows>();
    for (const row of rows) if (row.passageSetId) grouped.set(row.passageSetId, [...(grouped.get(row.passageSetId) ?? []), row]);
    return [...grouped].map(([id, questions]) => ({ id, part, setType: part === 1 ? "photographs" : part === 2 ? "question_response" : part === 3 ? "conversation" : "talk", questionIds: questions.sort((a, b) => a.questionOrder - b.questionOrder).map((q) => q.id) }));
  } catch { /* Measure eligible coverage without relaxing canonical validation. */ }
  return [];
}

async function loadEligibleUnits(pool: QuestionBankPool) {
  const [p1, p2, p3, p4, r5, r6, r7] = await Promise.all([listeningUnits(1, 6, pool), listeningUnits(2, 25, pool), listeningUnits(3, 13, pool), listeningUnits(4, 10, pool), loadUnits(5, undefined, undefined, pool), loadUnits(6, undefined, undefined, pool), loadUnits(7, undefined, undefined, pool)]);
  const ids = [...new Set([...r6, ...r7].map((unit) => unit.id))];
  const sets = ids.length ? await db.select({ id: passageSets.id, setType: passageSets.setType }).from(passageSets).where(inArray(passageSets.id, ids)) : [];
  const types = new Map(sets.map((set) => [set.id, set.setType]));
  const reading: MockUnit[] = [...r5.map((u) => ({ ...u, part: 5 as const, setType: "standalone" as const })), ...r6.filter((u) => u.questionIds.length === 4).map((u) => ({ ...u, part: 6 as const, setType: "part6" as const })), ...r7.flatMap((u) => { const type = types.get(u.id); return ["single", "double", "triple"].includes(type ?? "") ? [{ ...u, part: 7 as const, setType: type as "single" | "double" | "triple" }] : []; })];
  return { listening: [...p1, ...p2, ...p3, ...p4], reading, raw: { p1, p2, p3, p4, r5 } };
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function loadPlannedFullMock(tx: Tx, formNumber: number): Promise<{ configured: boolean; form: MockForm | null }> {
  const rows = await tx.select({
    position: fullMockFormQuestions.position, part: fullMockFormQuestions.part, questionId: fullMockFormQuestions.questionId,
    questionPart: questions.toeicPart, questionStatus: questions.status, bankPool: questions.bankPool, setId: questions.passageSetId,
    setType: passageSets.setType, setStatus: passageSets.status,
  }).from(fullMockFormQuestions).innerJoin(questions, eq(questions.id, fullMockFormQuestions.questionId))
    .leftJoin(passageSets, eq(passageSets.id, questions.passageSetId))
    .where(eq(fullMockFormQuestions.formNumber, formNumber)).orderBy(asc(fullMockFormQuestions.position));
  if (!rows.length) {
    const any = await tx.select({ number: fullMockFormQuestions.formNumber }).from(fullMockFormQuestions).limit(1);
    return { configured: any.length > 0, form: null };
  }
  if (rows.length !== 200 || rows.some((row, index) => row.position !== index + 1 || row.part !== row.questionPart || row.questionStatus !== "published" || row.bankPool !== "MOCK" || (row.part !== 5 && row.setStatus !== "published"))) return { configured: true, form: null };
  const units = new Map<string, MockUnit>();
  for (const row of rows) {
    const id = row.part === 5 ? row.questionId : row.setId;
    const setType = row.part === 1 ? "photographs" : row.part === 2 ? "question_response" : row.part === 5 ? "standalone" : row.setType;
    if (!id || !setType || row.part < 1 || row.part > 7) return { configured: true, form: null };
    const unit = units.get(id) ?? { id, part: row.part as MockUnit["part"], setType: setType as MockUnit["setType"], questionIds: [] };
    unit.questionIds.push(row.questionId);
    units.set(id, unit);
  }
  const form = assembleFullMock([...units.values()]);
  return { configured: true, form: form?.questionIds.length === 200 ? form : null };
}

export async function getMockHubReadiness(): Promise<MockHubReadiness> {
  const { listening, reading, raw } = await loadEligibleUnits("MOCK"); const listeningForm = assembleListeningMock(listening); const readingForm = assembleReadingMock(reading); const fullForm = assembleFullMock([...listening, ...reading]);
  const p7s = reading.filter((u) => u.part === 7 && u.setType === "single"); const p7m = reading.filter((u) => u.part === 7 && u.setType !== "single");
  return {
    listening: { ready: Boolean(listeningForm), ...(listeningForm ? { form: listeningForm } : {}), coverage: { p1: raw.p1.length, p2: raw.p2.length, p3Groups: raw.p3.length, p4Groups: raw.p4.length } },
    reading: { ready: Boolean(readingForm), ...(readingForm ? { form: readingForm } : {}), coverage: { p5: raw.r5.length, p6Groups: reading.filter((u) => u.part === 6).length, p6Questions: reading.filter((u) => u.part === 6).flatMap((u) => u.questionIds).length, p7SingleGroups: p7s.length, p7SingleQuestions: p7s.flatMap((u) => u.questionIds).length, p7MultipleGroups: p7m.length, p7MultipleQuestions: p7m.flatMap((u) => u.questionIds).length } },
    full: { ready: Boolean(listeningForm && readingForm && fullForm), ...(fullForm ? { form: fullForm } : {}) },
  };
}
export const getListeningMockReadiness = async () => (await getMockHubReadiness()).listening;
export const getReadingMockReadiness = async () => (await getMockHubReadiness()).reading;
export async function getFullMockReadiness() { const r = await getMockHubReadiness(); return { ready: r.full.ready, listening: r.listening.coverage, reading: r.reading.coverage, ...(r.full.form ? { form: r.full.form } : {}) }; }
export async function getChallengeFormReadiness(): Promise<MockReadiness> {
  if (process.env.PRACTICE_POOL_ISOLATED !== "true") return (await getMockHubReadiness()).full;
  const { listening, reading } = await loadEligibleUnits("PRACTICE");
  const form = assembleFullMock([...listening, ...reading]);
  return { ready: Boolean(form), ...(form ? { form } : {}) };
}

export async function getActiveMock(userId: string, mode: MockMode) { return (await db.select().from(fullMockRuns).where(and(eq(fullMockRuns.userId, userId), eq(fullMockRuns.mode, mode), inArray(fullMockRuns.status, ["LISTENING", "READING"]))).orderBy(desc(fullMockRuns.createdAt)).limit(1))[0] ?? null; }
export const getActiveFullMock = (userId: string) => getActiveMock(userId, "FULL");
const modeParts = (mode: MockMode) => mode === "LISTENING" ? [1,2,3,4] as const : mode === "READING" ? [5,6,7] as const : [1,2,3,4,5,6,7] as const;

export async function createMockRun(userId: string, mode: MockMode): Promise<{ ok: true; runId: string; resumed: boolean } | { ok: false; reason: "CONTENT_NOT_READY" }> {
  const active = await getActiveMock(userId, mode); if (active) return { ok: true, runId: active.id, resumed: true };
  const readiness = await getMockHubReadiness(); const selected = mode === "LISTENING" ? readiness.listening : mode === "READING" ? readiness.reading : readiness.full;
  if (!selected.ready || !selected.form) return { ok: false, reason: "CONTENT_NOT_READY" }; const fallbackForm = selected.form;
  const now = new Date(), runId = randomUUID(), section = mode === "READING" ? "READING" : "LISTENING";
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:mock:${mode}`}, 0))`);
    const [old] = await tx.select().from(fullMockRuns).where(and(eq(fullMockRuns.userId, userId), eq(fullMockRuns.mode, mode), inArray(fullMockRuns.status, ["LISTENING", "READING"]))).limit(1); if (old) return { ok: true as const, runId: old.id, resumed: true };
    let form = fallbackForm;
    let formNumber: number | null = null;
    if (mode === "FULL") {
      const [previous] = await tx.select({ formNumber: fullMockRuns.formNumber }).from(fullMockRuns)
        .where(and(eq(fullMockRuns.userId, userId), eq(fullMockRuns.mode, "FULL")))
        .orderBy(desc(fullMockRuns.createdAt)).limit(1);
      const next = ((previous?.formNumber ?? 0) % 25) + 1;
      const planned = await loadPlannedFullMock(tx, next);
      if (planned.configured && !planned.form) return { ok: false as const, reason: "CONTENT_NOT_READY" as const };
      if (planned.form) { form = planned.form; formNumber = next; }
    }
    await consumeUsage(tx, { userId, entitlement: "FULL_MOCK", sourceType: "FULL_MOCK_RUN", sourceId: runId, now });
    const [run] = await tx.insert(fullMockRuns).values({ id: runId, userId, mode, formNumber, status: section, listeningStartedAt: section === "LISTENING" ? now : null, listeningDeadline: section === "LISTENING" ? deadlineFrom(now, "LISTENING") : null, readingStartedAt: section === "READING" ? now : null, readingDeadline: section === "READING" ? deadlineFrom(now, "READING") : null }).returning({ id: fullMockRuns.id });
    for (const part of modeParts(mode)) { const units = form.byPart[part], questionIds = units.flatMap((u) => u.questionIds); const [session] = await tx.insert(practiceSessions).values({ userId, skillArea: part <= 4 ? "LISTENING" : "READING", practiceType: `full_mock_part_${part}`, part, status: "in_progress", questionCount: questionIds.length, requestedQuestionCount: questionIds.length, source: "full_mock", fullMockRunId: run.id, fullMockOrder: part }).returning({ id: practiceSessions.id }); const setByQuestion = new Map(units.flatMap((u) => u.questionIds.map((id) => [id, part === 5 ? null : u.id] as const))); await tx.insert(practiceSessionQuestions).values(questionIds.map((questionId, i) => ({ sessionId: session.id, questionId, displayOrder: i + 1, passageSetId: setByQuestion.get(questionId) ?? null }))); }
    return { ok: true as const, runId: run.id, resumed: false };
  });
}
export const createFullMock = (userId: string) => createMockRun(userId, "FULL");

export async function getFullMockRun(runId: string, userId: string) { const [run] = await db.select().from(fullMockRuns).where(and(eq(fullMockRuns.id, runId), eq(fullMockRuns.userId, userId))).limit(1); if (!run) return null; const children = await db.select().from(practiceSessions).where(eq(practiceSessions.fullMockRunId, run.id)).orderBy(asc(practiceSessions.fullMockOrder)); return { ...run, children }; }
export async function getActiveFullMockSection(runId: string, userId: string) { const run = await getFullMockRun(runId, userId); if (!run || !["LISTENING", "READING"].includes(run.status)) return null; const deadline = run.status === "LISTENING" ? run.listeningDeadline : run.readingDeadline; if (!deadline || deadline <= new Date()) return { run, expired: true as const, sessions: [] }; const sessions = await Promise.all(run.children.filter((s) => s.skillArea === run.status).map(async (session) => { const content = await getSafeSessionContent(session.id, run.status === "LISTENING"); const answers = await db.select({ questionId: fullMockAnswers.questionId, selectedOptionId: fullMockAnswers.selectedOptionId }).from(fullMockAnswers).where(and(eq(fullMockAnswers.sessionId, session.id), eq(fullMockAnswers.userId, userId))); return { session, questions: content.questions, groups: content.groups, answers: Object.fromEntries(answers.map((a) => [a.questionId, a.selectedOptionId])) }; })); return { run, expired: false as const, deadline: deadline.toISOString(), sessions }; }

export async function saveFullMockAnswer(input: { runId: string; sessionId: string; questionId: string; optionId: string; userId: string }) { return db.transaction(async (tx) => { const [row] = await tx.select({ run: fullMockRuns, session: practiceSessions }).from(practiceSessions).innerJoin(fullMockRuns, eq(fullMockRuns.id, practiceSessions.fullMockRunId)).where(and(eq(fullMockRuns.id, input.runId), eq(fullMockRuns.userId, input.userId), eq(practiceSessions.id, input.sessionId))).for("update").limit(1); if (!row || row.run.status !== row.session.skillArea) return { ok: false as const, reason: "LOCKED" as const }; const deadline = row.run.status === "LISTENING" ? row.run.listeningDeadline : row.run.readingDeadline; if (!deadline || deadline <= new Date()) return { ok: false as const, reason: "EXPIRED" as const }; const [[assigned], [option]] = await Promise.all([tx.select().from(practiceSessionQuestions).where(and(eq(practiceSessionQuestions.sessionId, input.sessionId), eq(practiceSessionQuestions.questionId, input.questionId))).limit(1), tx.select().from(questionOptions).where(and(eq(questionOptions.id, input.optionId), eq(questionOptions.questionId, input.questionId))).limit(1)]); if (!assigned || !option) return { ok: false as const, reason: "INVALID" as const }; await tx.insert(fullMockAnswers).values({ sessionId: input.sessionId, userId: input.userId, questionId: input.questionId, selectedOptionId: input.optionId }).onConflictDoUpdate({ target: [fullMockAnswers.sessionId, fullMockAnswers.questionId], set: { selectedOptionId: input.optionId, updatedAt: new Date() } }); return { ok: true as const }; }); }

async function scoreSection(tx: Tx, runId: string, userId: string, area: "LISTENING" | "READING", now: Date) { const sessions = await tx.select().from(practiceSessions).where(and(eq(practiceSessions.fullMockRunId, runId), eq(practiceSessions.skillArea, area))); for (const session of sessions) { if (session.status === "submitted") continue; const assigned = await tx.select().from(practiceSessionQuestions).where(eq(practiceSessionQuestions.sessionId, session.id)); const ids = assigned.map((a) => a.questionId); const [saved, solutions] = await Promise.all([tx.select().from(fullMockAnswers).where(eq(fullMockAnswers.sessionId, session.id)), tx.select().from(questionSolutions).where(inArray(questionSolutions.questionId, ids))]); const selected = new Map(saved.map((a) => [a.questionId, a])); const correct = new Map(solutions.map((s) => [s.questionId, s.correctOptionId])); const attempts = assigned.map((a) => ({ sessionId: session.id, userId, questionId: a.questionId, selectedOptionId: selected.get(a.questionId)?.selectedOptionId ?? null, isCorrect: selected.get(a.questionId)?.selectedOptionId === correct.get(a.questionId), answeredAt: selected.get(a.questionId)?.answeredAt ?? null })); await tx.insert(attemptAnswers).values(attempts).onConflictDoNothing(); await tx.update(practiceSessions).set({ status: "submitted", submittedAt: now, scoreCorrect: attempts.filter((a) => a.isCorrect).length, scoreTotal: assigned.length, submissionReason: "mock_section_complete" }).where(eq(practiceSessions.id, session.id)); } }
async function completeRun(tx: Tx, run: typeof fullMockRuns.$inferSelect, userId: string, now: Date) { const sessions = await tx.select({ id: practiceSessions.id }).from(practiceSessions).where(eq(practiceSessions.fullMockRunId, run.id)); const ids = sessions.map((s) => s.id); const attempts = await tx.select().from(attemptAnswers).where(and(eq(attemptAnswers.userId, userId), inArray(attemptAnswers.sessionId, ids))); if (attempts.length !== (run.mode === "FULL" ? 200 : 100)) throw new Error("MOCK_RUN_INCOMPLETE"); await reconcileMasteryAnswers(tx, userId, "full_mock", attempts); await awardCompletedLearning(tx, { userId, sourceType: "FULL_MOCK_RUN", sourceId: run.id, questionIds: attempts.map((a) => a.questionId), completion: run.mode === "FULL" ? "FULL_MOCK" : run.mode === "LISTENING" ? "LISTENING_100" : "READING_100" }); await tx.update(fullMockRuns).set({ status: "COMPLETED", completedAt: now, updatedAt: now, ...(run.mode === "LISTENING" ? { listeningCompletedAt: now } : { readingCompletedAt: now }) }).where(eq(fullMockRuns.id, run.id)); await tx.delete(fullMockAnswers).where(inArray(fullMockAnswers.sessionId, ids)); }
export async function finalizeFullMockSection(runId: string, userId: string) { return db.transaction(async (tx) => { const [run] = await tx.select().from(fullMockRuns).where(and(eq(fullMockRuns.id, runId), eq(fullMockRuns.userId, userId))).for("update").limit(1); if (!run) return { ok: false as const }; if (run.status === "COMPLETED") return { ok: true as const, status: "COMPLETED" as const }; const now = new Date(); if (run.status === "LISTENING") { await scoreSection(tx, run.id, userId, "LISTENING", now); if (run.mode === "FULL") { await tx.update(fullMockRuns).set({ status: "READING", listeningCompletedAt: now, readingStartedAt: now, readingDeadline: deadlineFrom(now, "READING"), updatedAt: now }).where(eq(fullMockRuns.id, run.id)); return { ok: true as const, status: "READING" as const }; } await completeRun(tx, run, userId, now); return { ok: true as const, status: "COMPLETED" as const }; } if (run.status !== "READING") return { ok: false as const }; await scoreSection(tx, run.id, userId, "READING", now); await completeRun(tx, run, userId, now); return { ok: true as const, status: "COMPLETED" as const }; }); }

export async function getFullMockResult(runId: string, userId: string) { const run = await getFullMockRun(runId, userId); if (!run || run.status !== "COMPLETED") return null; const parts = run.children.map((s) => ({ part: s.part!, correct: s.scoreCorrect!, attempted: s.scoreTotal!, accuracy: s.scoreTotal ? Math.round((s.scoreCorrect! / s.scoreTotal) * 100) : 0 })); const aggregate = (from: number, to: number) => { const rows = parts.filter((p) => p.part >= from && p.part <= to), correct = rows.reduce((n, p) => n + p.correct, 0), attempted = rows.reduce((n, p) => n + p.attempted, 0); return { correct, attempted, accuracy: attempted ? Math.round(correct / attempted * 100) : 0 }; }; return { id: run.id, mode: run.mode as MockMode, completedAt: run.completedAt!.toISOString(), listening: aggregate(1,4), reading: aggregate(5,7), overall: aggregate(1,7), parts }; }
export async function getFullMockHistory(userId: string, limit = 20) { const runs = await db.select().from(fullMockRuns).where(and(eq(fullMockRuns.userId, userId), eq(fullMockRuns.status, "COMPLETED"))).orderBy(desc(fullMockRuns.completedAt)).limit(limit); return Promise.all(runs.map((run) => getFullMockResult(run.id, userId))); }

/** Premium-only, server-authorized, set-based aggregation. No staged answers or answer keys leave the server. */
export async function getAdvancedMockHistory(userId: string): Promise<MockHistoryEntry[] | null> {
  if (!(await getEffectiveCapabilities(userId)).canUseAdvancedMockHistory) return null;
  const rows = await db.select({ runId: fullMockRuns.id, mode: fullMockRuns.mode, completedAt: fullMockRuns.completedAt, part: practiceSessions.part, correct: practiceSessions.scoreCorrect, total: practiceSessions.scoreTotal, answered: sql<number>`count(${attemptAnswers.selectedOptionId})::int` })
    .from(fullMockRuns).innerJoin(practiceSessions, eq(practiceSessions.fullMockRunId, fullMockRuns.id)).leftJoin(attemptAnswers, eq(attemptAnswers.sessionId, practiceSessions.id))
    .where(and(eq(fullMockRuns.userId, userId), eq(fullMockRuns.status, "COMPLETED"), eq(practiceSessions.status, "submitted")))
    .groupBy(fullMockRuns.id, fullMockRuns.mode, fullMockRuns.completedAt, practiceSessions.id, practiceSessions.part, practiceSessions.scoreCorrect, practiceSessions.scoreTotal)
    .orderBy(desc(fullMockRuns.completedAt), asc(practiceSessions.part));
  const grouped = new Map<string, MockHistoryEntry>();
  for (const row of rows) {
    if (!row.completedAt || row.part === null || row.correct === null || row.total === null) continue;
    let entry = grouped.get(row.runId);
    if (!entry) { entry = { runId: row.runId, mode: row.mode as MockMode, completedAt: row.completedAt.toISOString(), listening: null, reading: null, overall: { correct: 0, total: 0 }, parts: [] }; grouped.set(row.runId, entry); }
    entry.parts.push({ part: row.part, correct: row.correct, answered: Number(row.answered), total: row.total, accuracy: row.total ? Math.round(row.correct / row.total * 100) : 0 }); entry.overall.correct += row.correct; entry.overall.total += row.total;
  }
  for (const entry of grouped.values()) { const section = (from: number, to: number) => { const parts = entry.parts.filter((p) => p.part >= from && p.part <= to); return parts.length ? { correct: parts.reduce((n,p) => n + p.correct, 0), total: parts.reduce((n,p) => n + p.total, 0) } : null; }; entry.listening = section(1,4); entry.reading = section(5,7); }
  return [...grouped.values()];
}
