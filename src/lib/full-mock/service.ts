import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, fullMockAnswers, fullMockRuns, passageSets, practiceSessionQuestions, practiceSessions, questionOptions, questionSolutions } from "@/db/schema";
import { reconcileMasteryAnswers } from "@/lib/mastery/persistence";
import { getSafeSessionContent } from "@/lib/practice/queries";
import { loadUnits, selectListeningPractice } from "@/lib/practice/selector";
import { assembleFullMock, deadlineFrom, type MockForm, type MockUnit } from "./blueprint";
import { consumeUsage } from "@/lib/entitlements/service";
import { awardCompletedLearning } from "@/lib/gamification/award";

export type FullMockReadiness = {
  ready: boolean;
  listening: { p1: number; p2: number; p3Groups: number; p4Groups: number };
  reading: { p5: number; p6Groups: number; p6Questions: number; p7SingleGroups: number; p7SingleQuestions: number; p7MultipleGroups: number; p7MultipleQuestions: number };
  form?: MockForm;
};

async function listeningUnits(part: 1 | 2 | 3 | 4, groups: number): Promise<MockUnit[]> {
  for (let target = groups; target >= 1; target--) try {
    const rows = await selectListeningPractice(part, target);
    const grouped = new Map<string, typeof rows>();
    for (const row of rows) if (row.passageSetId) grouped.set(row.passageSetId, [...(grouped.get(row.passageSetId) ?? []), row]);
    return [...grouped].map(([id, questions]) => ({ id, part, setType: part === 1 ? "photographs" : part === 2 ? "question_response" : part === 3 ? "conversation" : "talk", questionIds: questions.sort((a, b) => a.questionOrder - b.questionOrder).map((q) => q.id) }));
  } catch { /* discover exact eligible coverage up to the required count */ }
  return [];
}

export async function getFullMockReadiness(): Promise<FullMockReadiness> {
  const [p1, p2, p3, p4, r5, r6, r7] = await Promise.all([
    listeningUnits(1, 6), listeningUnits(2, 25), listeningUnits(3, 13), listeningUnits(4, 10), loadUnits(5), loadUnits(6), loadUnits(7),
  ]);
  const setIds = [...new Set([...r6, ...r7].map((unit) => unit.id))];
  const sets = setIds.length ? await db.select({ id: passageSets.id, setType: passageSets.setType }).from(passageSets).where(inArray(passageSets.id, setIds)) : [];
  const types = new Map(sets.map((set) => [set.id, set.setType]));
  const readingUnits: MockUnit[] = [
    ...r5.map((unit) => ({ ...unit, part: 5 as const, setType: "standalone" as const })),
    ...r6.filter((unit) => unit.questionIds.length === 4).map((unit) => ({ ...unit, part: 6 as const, setType: "part6" as const })),
    ...r7.flatMap((unit) => { const setType = types.get(unit.id); return ["single", "double", "triple"].includes(setType ?? "") ? [{ ...unit, part: 7 as const, setType: setType as "single" | "double" | "triple" }] : []; }),
  ];
  const units = [...p1, ...p2, ...p3, ...p4, ...readingUnits];
  const form = assembleFullMock(units);
  const p7s = readingUnits.filter((u) => u.part === 7 && u.setType === "single"); const p7m = readingUnits.filter((u) => u.part === 7 && u.setType !== "single");
  return {
    ready: Boolean(form),
    listening: { p1: p1.length, p2: p2.length, p3Groups: p3.length, p4Groups: p4.length },
    reading: { p5: r5.length, p6Groups: readingUnits.filter((u) => u.part === 6).length, p6Questions: readingUnits.filter((u) => u.part === 6).flatMap((u) => u.questionIds).length, p7SingleGroups: p7s.length, p7SingleQuestions: p7s.flatMap((u) => u.questionIds).length, p7MultipleGroups: p7m.length, p7MultipleQuestions: p7m.flatMap((u) => u.questionIds).length },
    ...(form ? { form } : {}),
  };
}

export async function getActiveFullMock(userId: string) {
  return (await db.select().from(fullMockRuns).where(and(eq(fullMockRuns.userId, userId), inArray(fullMockRuns.status, ["LISTENING", "READING"]))).orderBy(desc(fullMockRuns.createdAt)).limit(1))[0] ?? null;
}

export async function createFullMock(userId: string): Promise<{ ok: true; runId: string; resumed: boolean } | { ok: false; reason: "CONTENT_NOT_READY" }> {
  const active = await getActiveFullMock(userId); if (active) return { ok: true, runId: active.id, resumed: true };
  const readiness = await getFullMockReadiness(); if (!readiness.ready || !readiness.form) return { ok: false, reason: "CONTENT_NOT_READY" };
  const now = new Date(); const runId = randomUUID();
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:full-mock`}, 0))`);
    const [existing] = await tx.select().from(fullMockRuns).where(and(eq(fullMockRuns.userId, userId), inArray(fullMockRuns.status, ["LISTENING", "READING"]))).limit(1);
    if (existing) return { ok: true as const, runId: existing.id, resumed: true };
    await consumeUsage(tx, { userId, entitlement: "FULL_MOCK", sourceType: "FULL_MOCK_RUN", sourceId: runId, now });
    const [run] = await tx.insert(fullMockRuns).values({ id: runId, userId, listeningStartedAt: now, listeningDeadline: deadlineFrom(now, "LISTENING") }).returning({ id: fullMockRuns.id });
    for (const part of [1,2,3,4,5,6,7] as const) {
      const units = readiness.form!.byPart[part]; const ids = units.flatMap((unit) => unit.questionIds);
      const [session] = await tx.insert(practiceSessions).values({ userId, skillArea: part <= 4 ? "LISTENING" : "READING", practiceType: `full_mock_part_${part}`, part, status: "in_progress", questionCount: ids.length, requestedQuestionCount: ids.length, source: "full_mock", fullMockRunId: run.id, fullMockOrder: part }).returning({ id: practiceSessions.id });
      const setByQuestion = new Map(units.flatMap((unit) => unit.questionIds.map((id) => [id, part === 5 ? null : unit.id] as const)));
      await tx.insert(practiceSessionQuestions).values(ids.map((questionId, index) => ({ sessionId: session.id, questionId, displayOrder: index + 1, passageSetId: setByQuestion.get(questionId) ?? null })));
    }
    return { ok: true as const, runId: run.id, resumed: false };
  });
}

export async function getFullMockRun(runId: string, userId: string) {
  const [run] = await db.select().from(fullMockRuns).where(and(eq(fullMockRuns.id, runId), eq(fullMockRuns.userId, userId))).limit(1); if (!run) return null;
  const children = await db.select().from(practiceSessions).where(eq(practiceSessions.fullMockRunId, run.id)).orderBy(asc(practiceSessions.fullMockOrder));
  return { ...run, children };
}

export async function getActiveFullMockSection(runId: string, userId: string) {
  const run = await getFullMockRun(runId, userId); if (!run || !["LISTENING", "READING"].includes(run.status)) return null;
  const deadline = run.status === "LISTENING" ? run.listeningDeadline : run.readingDeadline; if (!deadline || deadline <= new Date()) return { run, expired: true as const, sessions: [] };
  const sessions = await Promise.all(run.children.filter((s) => s.skillArea === run.status).map(async (session) => { const content = await getSafeSessionContent(session.id, run.status === "LISTENING"); const answers = await db.select({ questionId: fullMockAnswers.questionId, selectedOptionId: fullMockAnswers.selectedOptionId }).from(fullMockAnswers).where(and(eq(fullMockAnswers.sessionId, session.id), eq(fullMockAnswers.userId, userId))); return { session, questions: content.questions, groups: content.groups, answers: Object.fromEntries(answers.map((a) => [a.questionId, a.selectedOptionId])) }; }));
  return { run, expired: false as const, deadline: deadline.toISOString(), sessions };
}

export async function saveFullMockAnswer(input: { runId: string; sessionId: string; questionId: string; optionId: string; userId: string }) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select({ run: fullMockRuns, session: practiceSessions }).from(practiceSessions).innerJoin(fullMockRuns, eq(fullMockRuns.id, practiceSessions.fullMockRunId)).where(and(eq(fullMockRuns.id, input.runId), eq(fullMockRuns.userId, input.userId), eq(practiceSessions.id, input.sessionId))).for("update").limit(1);
    if (!row || row.run.status !== row.session.skillArea) return { ok: false as const, reason: "LOCKED" as const };
    const deadline = row.run.status === "LISTENING" ? row.run.listeningDeadline : row.run.readingDeadline; if (!deadline || deadline <= new Date()) return { ok: false as const, reason: "EXPIRED" as const };
    const [[assigned], [option]] = await Promise.all([tx.select().from(practiceSessionQuestions).where(and(eq(practiceSessionQuestions.sessionId, input.sessionId), eq(practiceSessionQuestions.questionId, input.questionId))).limit(1), tx.select().from(questionOptions).where(and(eq(questionOptions.id, input.optionId), eq(questionOptions.questionId, input.questionId))).limit(1)]);
    if (!assigned || !option) return { ok: false as const, reason: "INVALID" as const };
    await tx.insert(fullMockAnswers).values({ sessionId: input.sessionId, userId: input.userId, questionId: input.questionId, selectedOptionId: input.optionId }).onConflictDoUpdate({ target: [fullMockAnswers.sessionId, fullMockAnswers.questionId], set: { selectedOptionId: input.optionId, updatedAt: new Date() } });
    return { ok: true as const };
  });
}

async function scoreSection(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], runId: string, userId: string, area: "LISTENING" | "READING", now: Date) {
  const sessions = await tx.select().from(practiceSessions).where(and(eq(practiceSessions.fullMockRunId, runId), eq(practiceSessions.skillArea, area)));
  for (const session of sessions) {
    if (session.status === "submitted") continue;
    const assigned = await tx.select().from(practiceSessionQuestions).where(eq(practiceSessionQuestions.sessionId, session.id)); const ids = assigned.map((a) => a.questionId);
    const [saved, solutions] = await Promise.all([tx.select().from(fullMockAnswers).where(eq(fullMockAnswers.sessionId, session.id)), tx.select().from(questionSolutions).where(inArray(questionSolutions.questionId, ids))]);
    const selected = new Map(saved.map((a) => [a.questionId, a])); const correct = new Map(solutions.map((s) => [s.questionId, s.correctOptionId]));
    const attempts = assigned.map((a) => ({ sessionId: session.id, userId, questionId: a.questionId, selectedOptionId: selected.get(a.questionId)?.selectedOptionId ?? null, isCorrect: selected.get(a.questionId)?.selectedOptionId === correct.get(a.questionId), answeredAt: selected.get(a.questionId)?.answeredAt ?? null }));
    await tx.insert(attemptAnswers).values(attempts).onConflictDoNothing();
    await tx.update(practiceSessions).set({ status: "submitted", submittedAt: now, scoreCorrect: attempts.filter((a) => a.isCorrect).length, scoreTotal: assigned.length, submissionReason: "mock_section_complete" }).where(eq(practiceSessions.id, session.id));
  }
}

export async function finalizeFullMockSection(runId: string, userId: string) {
  return db.transaction(async (tx) => {
    const [run] = await tx.select().from(fullMockRuns).where(and(eq(fullMockRuns.id, runId), eq(fullMockRuns.userId, userId))).for("update").limit(1); if (!run) return { ok: false as const };
    if (run.status === "COMPLETED") return { ok: true as const, status: "COMPLETED" as const };
    const now = new Date();
    if (run.status === "LISTENING") { await scoreSection(tx, run.id, userId, "LISTENING", now); await tx.update(fullMockRuns).set({ status: "READING", listeningCompletedAt: now, readingStartedAt: now, readingDeadline: deadlineFrom(now, "READING"), updatedAt: now }).where(eq(fullMockRuns.id, run.id)); return { ok: true as const, status: "READING" as const }; }
    if (run.status !== "READING") return { ok: false as const };
    await scoreSection(tx, run.id, userId, "READING", now);
    const sessions = await tx.select({ id: practiceSessions.id }).from(practiceSessions).where(eq(practiceSessions.fullMockRunId, run.id)); const ids = sessions.map((s) => s.id);
    const attempts = await tx.select().from(attemptAnswers).where(and(eq(attemptAnswers.userId, userId), inArray(attemptAnswers.sessionId, ids)));
    if (attempts.length !== 200) throw new Error("FULL_MOCK_INCOMPLETE");
    await reconcileMasteryAnswers(tx, userId, "full_mock", attempts);
    await awardCompletedLearning(tx,{userId,sourceType:"FULL_MOCK_RUN",sourceId:run.id,questionIds:attempts.map(a=>a.questionId),completion:"FULL_MOCK"});
    await tx.update(fullMockRuns).set({ status: "COMPLETED", readingCompletedAt: now, completedAt: now, updatedAt: now }).where(eq(fullMockRuns.id, run.id));
    await tx.delete(fullMockAnswers).where(inArray(fullMockAnswers.sessionId, ids));
    return { ok: true as const, status: "COMPLETED" as const };
  });
}

export async function getFullMockResult(runId: string, userId: string) {
  const run = await getFullMockRun(runId, userId); if (!run || run.status !== "COMPLETED") return null;
  const parts = run.children.map((s) => ({ part: s.part!, correct: s.scoreCorrect!, attempted: s.scoreTotal!, accuracy: s.scoreTotal ? Math.round((s.scoreCorrect! / s.scoreTotal) * 100) : 0 }));
  const aggregate = (from: number, to: number) => { const rows = parts.filter((p) => p.part >= from && p.part <= to); const correct = rows.reduce((n, p) => n + p.correct, 0); const attempted = rows.reduce((n, p) => n + p.attempted, 0); return { correct, attempted, accuracy: Math.round(correct / attempted * 100) }; };
  return { id: run.id, completedAt: run.completedAt!.toISOString(), listening: aggregate(1,4), reading: aggregate(5,7), overall: aggregate(1,7), parts };
}

export async function getFullMockHistory(userId: string) {
  const runs = await db.select().from(fullMockRuns).where(and(eq(fullMockRuns.userId, userId), eq(fullMockRuns.status, "COMPLETED"))).orderBy(desc(fullMockRuns.completedAt)).limit(20);
  return Promise.all(runs.map((run) => getFullMockResult(run.id, userId)));
}
