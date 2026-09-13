"use server";
import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { attemptAnswers, practiceSessionQuestions, practiceSessions, questionOptions, questionSolutions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { createReadingPracticeSession, validatePracticeConfig } from "@/lib/practice/selector";
import type { PracticeConfig, ReadingPracticeMode, SubmittedAnswer } from "@/lib/practice/types";

function parseConfig(formData: FormData): PracticeConfig | null { const config = { mode: String(formData.get("mode") ?? "") as ReadingPracticeMode, targetQuestionCount: Number(formData.get("questionCount")), source: formData.get("source") === "recommended" ? "recommended" : "custom", skill: String(formData.get("skill") ?? "").trim() || undefined, subSkill: String(formData.get("subSkill") ?? "").trim() || undefined } as PracticeConfig; return validatePracticeConfig(config) ? config : null; }
export async function startReadingPractice(formData: FormData) { const config = parseConfig(formData); if (!config) redirect("/practice?error=invalid_config"); const user = await getCurrentUser(); if (!user) redirect("/sign-in"); try { redirect(`/practice/${await createReadingPracticeSession(user.id, config)}`); } catch (error) { if (typeof error === "object" && error && "digest" in error) throw error; console.error("Could not start Reading practice", error); redirect(`/practice?error=${error instanceof Error && error.message === "NO_PUBLISHED_CONTENT" ? "not_enough_content" : "start_failed"}`); } }
type SubmitResult = { ok: true; sessionId: string } | { ok: false; error: "session_expired" | "submit_failed" };
export async function submitReadingPractice(sessionId: string, answers: SubmittedAnswer[]): Promise<SubmitResult> {
  const user = await getCurrentUser(); if (!user) return { ok: false, error: "session_expired" }; if (!sessionId || !Array.isArray(answers) || answers.length > 30 || new Set(answers.map((a) => a.questionId)).size !== answers.length) return { ok: false, error: "submit_failed" };
  try { await db.transaction(async (tx) => {
    const [session] = await tx.select().from(practiceSessions).where(and(eq(practiceSessions.id, sessionId), eq(practiceSessions.userId, user.id))).for("update").limit(1); if (!session) throw new Error("NOT_FOUND"); if (session.status === "submitted") return; if (session.status !== "in_progress" || session.practiceType === "demo_test") throw new Error("INVALID");
    const assigned = await tx.select().from(practiceSessionQuestions).where(eq(practiceSessionQuestions.sessionId, sessionId)); if (assigned.length !== session.questionCount) throw new Error("INCOMPLETE"); const ids = assigned.map((a) => a.questionId); if (answers.some((a) => !ids.includes(String(a.questionId)))) throw new Error("INJECTED");
    const [solutions, options] = await Promise.all([tx.select().from(questionSolutions).where(inArray(questionSolutions.questionId, ids)), tx.select().from(questionOptions).where(inArray(questionOptions.questionId, ids))]); const solutionMap = new Map(solutions.map((s) => [s.questionId, s.correctOptionId])); const input = new Map(answers.map((a) => [String(a.questionId), a])); let correct = 0;
    const rows = assigned.map((a) => { const answer = input.get(a.questionId); const selected = answer?.selectedOptionId ? String(answer.selectedOptionId) : null; if (selected && !options.some((o) => o.id === selected && o.questionId === a.questionId)) throw new Error("BAD_OPTION"); const isCorrect = selected !== null && selected === solutionMap.get(a.questionId); if (isCorrect) correct++; return { sessionId, userId: user.id, questionId: a.questionId, selectedOptionId: selected, isCorrect, responseTimeMs: Number.isInteger(answer?.responseTimeMs) ? Math.min(Math.max(answer!.responseTimeMs!, 0), 86_400_000) : null, answeredAt: selected ? new Date() : null }; });
    await tx.insert(attemptAnswers).values(rows); await tx.update(practiceSessions).set({ status: "submitted", submittedAt: new Date(), scoreCorrect: correct, scoreTotal: session.questionCount }).where(and(eq(practiceSessions.id, sessionId), eq(practiceSessions.status, "in_progress")));
  }); return { ok: true, sessionId }; } catch (error) { console.error("Could not submit Reading practice", error); return { ok: false, error: "submit_failed" }; }
}
export async function startPart5Practice(formData: FormData) { formData.set("mode", "part_5"); formData.set("source", "custom"); return startReadingPractice(formData); }
export const submitPart5Practice = submitReadingPractice;
