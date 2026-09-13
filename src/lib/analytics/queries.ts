import "server-only";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, practiceSessions, questions } from "@/db/schema";
import type { ReadingPart } from "@/lib/practice/types";
import { calculateLearnerAnalytics, percentage } from "./calculate";
import type { AnalyticsAttempt, LearnerAnalytics, RecentSession } from "./types";

export async function getLearnerAnalytics(userId: string, options: { excludeSessionId?: string } = {}): Promise<LearnerAnalytics> {
  const rows = await db.select().from(practiceSessions).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "submitted"), isNotNull(practiceSessions.submittedAt))).orderBy(desc(practiceSessions.submittedAt));
  const candidates = rows.filter((s) => s.id !== options.excludeSessionId && s.questionCount > 0 && s.scoreTotal === s.questionCount && s.scoreCorrect !== null && s.scoreCorrect >= 0 && s.scoreCorrect <= s.scoreTotal);
  if (!candidates.length) return calculateLearnerAnalytics([], []); const ids = candidates.map((s) => s.id);
  const answers = await db.select().from(attemptAnswers).where(and(eq(attemptAnswers.userId, userId), inArray(attemptAnswers.sessionId, ids))); const questionIds = [...new Set(answers.map((a) => a.questionId))]; const taxonomyRows = questionIds.length ? await db.select({ id: questions.id, skill: questions.skill, subSkill: questions.subSkill, part: questions.toeicPart }).from(questions).where(inArray(questions.id, questionIds)) : [];
  const taxonomy = new Map(taxonomyRows.map((q) => [q.id, q])); const bySession = new Map<string, typeof answers>(); for (const a of answers) bySession.set(a.sessionId, [...(bySession.get(a.sessionId) ?? []), a]);
  const valid = candidates.filter((s) => { const a = bySession.get(s.id) ?? []; return a.length === s.questionCount && new Set(a.map((x) => x.questionId)).size === s.questionCount && a.filter((x) => x.isCorrect).length === s.scoreCorrect && a.every((x) => { const q = taxonomy.get(x.questionId); return q && [5, 6, 7].includes(q.part); }); }); const validIds = new Set(valid.map((s) => s.id));
  const attempts: AnalyticsAttempt[] = answers.flatMap((a) => { if (!validIds.has(a.sessionId)) return []; const q = taxonomy.get(a.questionId)!; return [{ isCorrect: a.isCorrect, skill: q.skill, subSkill: q.subSkill, part: q.part as ReadingPart, answeredAt: (a.createdAt ?? valid.find((s) => s.id === a.sessionId)!.submittedAt!).toISOString(), sessionId: a.sessionId }]; });
  const sessions: RecentSession[] = valid.map((s) => ({ id: s.id, submittedAt: s.submittedAt!.toISOString(), correct: s.scoreCorrect!, total: s.scoreTotal!, accuracy: percentage(s.scoreCorrect!, s.scoreTotal!), mode: s.practiceType as RecentSession["mode"] })); return calculateLearnerAnalytics(attempts, sessions);
}
