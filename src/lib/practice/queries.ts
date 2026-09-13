import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, passageSets, passages, practiceSessionQuestions, practiceSessions, questionOptions, questionSolutions, questions } from "@/db/schema";
import type { PracticeGroup, PracticeQuestion, PracticeResult, PracticeSession } from "./types";

async function getOwnedSession(sessionId: string, userId: string) { return (await db.select().from(practiceSessions).where(and(eq(practiceSessions.id, sessionId), eq(practiceSessions.userId, userId))).limit(1))[0] ?? null; }

export async function getSafeSessionContent(sessionId: string) {
  const assigned = await db.select().from(practiceSessionQuestions).where(eq(practiceSessionQuestions.sessionId, sessionId)).orderBy(asc(practiceSessionQuestions.displayOrder));
  const questionIds = assigned.map((row) => row.questionId); if (!questionIds.length) return { questions: [], groups: [] };
  const setIds = [...new Set(assigned.flatMap((row) => row.passageSetId ?? []))];
  const [questionRows, options, sets, docs] = await Promise.all([
    db.select().from(questions).where(inArray(questions.id, questionIds)), db.select().from(questionOptions).where(inArray(questionOptions.questionId, questionIds)).orderBy(asc(questionOptions.displayOrder)),
    setIds.length ? db.select().from(passageSets).where(inArray(passageSets.id, setIds)) : [], setIds.length ? db.select().from(passages).where(inArray(passages.passageSetId, setIds)).orderBy(asc(passages.position)) : [],
  ]);
  const questionMap = new Map(questionRows.map((q) => [q.id, q]));
  const safeQuestions: PracticeQuestion[] = assigned.map((assignment) => { const q = questionMap.get(assignment.questionId); if (!q || ![5, 6, 7].includes(q.toeicPart) || q.passageSetId !== assignment.passageSetId) throw new Error("INVALID_PRACTICE_QUESTION"); return { id: q.id, number: assignment.displayOrder, part: q.toeicPart as 5 | 6 | 7, text: q.questionText, skill: q.skill, subSkill: q.subSkill, passageSetId: q.passageSetId, options: options.filter((o) => o.questionId === q.id).map((o) => ({ id: o.id, key: o.optionKey, text: o.optionText })) }; });
  const setMap = new Map(sets.map((set) => [set.id, set])); const groups: PracticeGroup[] = [];
  for (const question of safeQuestions) {
    if (!question.passageSetId) { groups.push({ id: question.id, part: question.part, setType: "standalone", title: null, passages: [], questions: [question] }); continue; }
    if (groups.some((group) => group.id === question.passageSetId)) continue; const set = setMap.get(question.passageSetId); if (!set || set.status !== "published") throw new Error("INVALID_PASSAGE_SET");
    const setDocs = docs.filter((p) => p.passageSetId === set.id); if (!setDocs.length || setDocs.some((p) => p.status !== "published" || !p.content || !p.position || !p.documentType)) throw new Error("INCOMPLETE_PASSAGE_SET");
    groups.push({ id: set.id, part: set.toeicPart as 6 | 7, setType: set.setType as PracticeGroup["setType"], title: set.title, passages: setDocs.map((p) => ({ id: p.id, title: p.title, content: p.content!, position: p.position!, documentType: p.documentType! })), questions: safeQuestions.filter((item) => item.passageSetId === set.id) });
  }
  return { questions: safeQuestions, groups };
}

export async function getPracticeSession(sessionId: string, userId: string): Promise<PracticeSession | null | "submitted"> {
  const session = await getOwnedSession(sessionId, userId); if (!session || session.practiceType === "demo_test") return null; if (session.status === "submitted") return "submitted"; if (session.status !== "in_progress") return null;
  const content = await getSafeSessionContent(session.id); if (content.questions.length !== session.questionCount || content.questions.some((q) => q.options.length !== 4)) throw new Error("PRACTICE_LOAD_FAILED");
  return { id: session.id, status: "in_progress", questionCount: session.questionCount, requestedQuestionCount: session.requestedQuestionCount, mode: session.practiceType as PracticeSession["mode"], source: session.source as PracticeSession["source"], requestedSkill: session.requestedSkill, requestedSubSkill: session.requestedSubSkill, ...content };
}

export async function getPracticeResult(sessionId: string, userId: string): Promise<PracticeResult | null | "in_progress"> {
  const session = await getOwnedSession(sessionId, userId); if (!session || session.practiceType === "demo_test") return null; if (session.status === "in_progress") return "in_progress";
  if (session.status !== "submitted" || session.scoreCorrect === null || session.scoreTotal === null || !session.submittedAt) return null;
  const content = await getSafeSessionContent(session.id); const ids = content.questions.map((q) => q.id);
  const [answers, solutions] = await Promise.all([db.select().from(attemptAnswers).where(and(eq(attemptAnswers.sessionId, session.id), eq(attemptAnswers.userId, userId))), db.select().from(questionSolutions).where(inArray(questionSolutions.questionId, ids))]);
  const answerMap = new Map(answers.map((a) => [a.questionId, a])); const solutionMap = new Map(solutions.map((s) => [s.questionId, s]));
  const reviewQuestions = content.questions.map((q) => { const a = answerMap.get(q.id); const s = solutionMap.get(q.id); if (!a || !s) throw new Error("INCOMPLETE_PRACTICE_RESULT"); return { ...q, selectedOptionId: a.selectedOptionId, correctOptionId: s.correctOptionId, isCorrect: a.isCorrect, explanationEn: s.explanationEn, explanationVi: s.explanationVi }; });
  const map = new Map(reviewQuestions.map((q) => [q.id, q]));
  return { id: session.id, mode: session.practiceType as PracticeResult["mode"], source: session.source as PracticeResult["source"], requestedSkill: session.requestedSkill, requestedSubSkill: session.requestedSubSkill, requestedQuestionCount: session.requestedQuestionCount, scoreCorrect: session.scoreCorrect, scoreTotal: session.scoreTotal, submittedAt: session.submittedAt.toISOString(), questions: reviewQuestions, groups: content.groups.map((group) => ({ ...group, questions: group.questions.map((q) => map.get(q.id)!) })) };
}
