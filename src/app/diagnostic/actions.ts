"use server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { attemptAnswers, diagnosticRuns, practiceSessionQuestions, practiceSessions, questionOptions, questionSolutions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateDiagnostic } from "@/lib/diagnostic/service";
import { getGuestOwnerHash, requireGuestOwnerHash } from "@/lib/guest/identity";
import type { SubmittedAnswer } from "@/lib/practice/types";
import { evaluateMultipleChoice } from "@/lib/toeic/evaluation";
import { reconcileMasteryAnswers } from "@/lib/mastery/persistence";
import { awardCompletedLearning } from "@/lib/gamification/award";

async function owner() { const user = await getCurrentUser(); return user ? { userId: user.id } as const : { guestOwnerHash: await requireGuestOwnerHash() } as const; }
export async function startDiagnostic() { let runId: string; try { runId = await getOrCreateDiagnostic(await owner()); } catch (error) { console.error("Could not create diagnostic", error); redirect("/diagnostic?error=unavailable"); } redirect(`/diagnostic/${runId}`); }

export async function submitDiagnosticPart(runId: string, sessionId: string, answers: SubmittedAnswer[]) {
  const current = await owner();
  try {
    const done = await db.transaction(async (tx) => {
      const ownerCondition = "userId" in current ? eq(diagnosticRuns.userId, current.userId!) : eq(diagnosticRuns.guestOwnerHash, current.guestOwnerHash!);
      const [run] = await tx.select().from(diagnosticRuns).where(and(eq(diagnosticRuns.id, runId), ownerCondition)).for("update").limit(1);
      if (!run || run.status !== "IN_PROGRESS" || run.expiresAt <= new Date()) throw new Error("INVALID_RUN");
      const [session] = await tx.select().from(practiceSessions).where(and(eq(practiceSessions.id, sessionId), eq(practiceSessions.diagnosticRunId, runId))).for("update").limit(1);
      if (!session || session.status !== "in_progress" || session.source !== "diagnostic") throw new Error("INVALID_SESSION");
      const prior = await tx.select({ id: practiceSessions.id }).from(practiceSessions).where(and(eq(practiceSessions.diagnosticRunId, runId), eq(practiceSessions.status, "in_progress"))).orderBy(asc(practiceSessions.diagnosticOrder));
      if (prior[0]?.id !== sessionId) throw new Error("OUT_OF_ORDER");
      const assigned = await tx.select().from(practiceSessionQuestions).where(eq(practiceSessionQuestions.sessionId, sessionId));
      const ids = assigned.map((row) => row.questionId); if (assigned.length !== session.questionCount || answers.length > session.questionCount || answers.some((a) => !ids.includes(String(a.questionId)))) throw new Error("BAD_ANSWERS");
      const [solutions, options] = await Promise.all([tx.select().from(questionSolutions).where(inArray(questionSolutions.questionId, ids)), tx.select().from(questionOptions).where(inArray(questionOptions.questionId, ids))]);
      const input = new Map(answers.map((answer) => [String(answer.questionId), answer])); let correct = 0;
      const rows = assigned.map((assignment) => { const answer = input.get(assignment.questionId); const selected = answer?.selectedOptionId ? String(answer.selectedOptionId) : null; if (selected && !options.some((option) => option.id === selected && option.questionId === assignment.questionId)) throw new Error("BAD_OPTION"); const solution = solutions.find((item) => item.questionId === assignment.questionId); if (!solution) throw new Error("MISSING_SOLUTION"); const isCorrect = evaluateMultipleChoice({ type: "MULTIPLE_CHOICE", selectedOptionId: selected }, solution.correctOptionId).isCorrect; if (isCorrect) correct++; return { sessionId, userId: "userId" in current ? current.userId : null, questionId: assignment.questionId, responseType: "MULTIPLE_CHOICE", selectedOptionId: selected, isCorrect, responseTimeMs: answer?.responseTimeMs ?? null, answeredAt: selected ? new Date() : null }; });
      await tx.insert(attemptAnswers).values(rows);
      await reconcileMasteryAnswers(tx, "userId" in current ? current.userId ?? null : null, session.source, rows);
      await tx.update(practiceSessions).set({ status: "submitted", submittedAt: new Date(), scoreCorrect: correct, scoreTotal: session.questionCount }).where(eq(practiceSessions.id, sessionId));
      const remaining = await tx.select({ id: practiceSessions.id }).from(practiceSessions).where(and(eq(practiceSessions.diagnosticRunId, runId), eq(practiceSessions.status, "in_progress")));
      if ("userId" in current) await awardCompletedLearning(tx,{userId:current.userId??null,sourceType:"DIAGNOSTIC_RUN",sourceId:runId,questionIds:rows.map(r=>r.questionId),completion:remaining.length?undefined:"DIAGNOSTIC"});
      if (!remaining.length) await tx.update(diagnosticRuns).set({ status: "COMPLETED", completedAt: new Date() }).where(eq(diagnosticRuns.id, runId));
      return remaining.length === 0;
    });
    revalidatePath("/dashboard"); revalidatePath("/progress"); revalidatePath(`/diagnostic/${runId}`);
    return { ok: true as const, completed: done };
  } catch (error) { console.error("Could not submit diagnostic Part", error); return { ok: false as const }; }
}

export async function resumeDiagnostic() {
  const user = await getCurrentUser(); const guest = user ? null : await getGuestOwnerHash();
  if (!user && !guest) redirect("/diagnostic");
  redirect(`/diagnostic/${await getOrCreateDiagnostic(user ? { userId: user.id } : { guestOwnerHash: guest! })}`);
}
