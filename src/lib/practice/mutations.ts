import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, practiceAnswerDrafts, practiceSessionQuestions, practiceSessions, questionOptions, questionSolutions, questions } from "@/db/schema";
import { awardCompletedLearning } from "@/lib/gamification/award";
import { reconcileMasteryAnswers } from "@/lib/mastery/persistence";
import { evaluateMultipleChoice } from "@/lib/toeic/evaluation";
import type { SubmittedAnswer } from "./types";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Owner = { userId: string; guestOwnerHash?: never } | { userId?: never; guestOwnerHash: string };

function ownerCondition(sessionId: string, owner: Owner) {
  return "userId" in owner
    ? and(eq(practiceSessions.id, sessionId), eq(practiceSessions.userId, owner.userId!))
    : and(eq(practiceSessions.id, sessionId), eq(practiceSessions.guestOwnerHash, owner.guestOwnerHash!));
}

async function submittedResult(tx: Transaction, sessionId: string) {
  const [session] = await tx.select({ id: practiceSessions.id, status: practiceSessions.status, scoreCorrect: practiceSessions.scoreCorrect, scoreTotal: practiceSessions.scoreTotal, submittedAt: practiceSessions.submittedAt })
    .from(practiceSessions).where(eq(practiceSessions.id, sessionId)).limit(1);
  if (!session || session.status !== "submitted" || session.scoreCorrect === null || session.scoreTotal === null || !session.submittedAt) throw new Error("INCOMPLETE_RESULT");
  const assignments = await tx.select({ questionId: practiceSessionQuestions.questionId, displayOrder: practiceSessionQuestions.displayOrder }).from(practiceSessionQuestions).where(eq(practiceSessionQuestions.sessionId, sessionId));
  const questionIds = assignments.map((item) => item.questionId);
  // A transaction is pinned to one pg client. Keep its queries sequential;
  // concurrent client.query calls are deprecated in pg and will fail in v9.
  const questionRows = await tx.select({ id: questions.id, part: questions.toeicPart, text: questions.questionText }).from(questions).where(inArray(questions.id, questionIds));
  const optionRows = await tx.select().from(questionOptions).where(inArray(questionOptions.questionId, questionIds));
  const solutionRows = await tx.select().from(questionSolutions).where(inArray(questionSolutions.questionId, questionIds));
  const answerRows = await tx.select().from(attemptAnswers).where(eq(attemptAnswers.sessionId, sessionId));
  return {
    id: session.id,
    status: "submitted" as const,
    scoreCorrect: session.scoreCorrect,
    scoreTotal: session.scoreTotal,
    submittedAt: session.submittedAt.toISOString(),
    results: assignments.sort((a, b) => a.displayOrder - b.displayOrder).map((assignment) => {
      const question = questionRows.find((item) => item.id === assignment.questionId);
      const answer = answerRows.find((item) => item.questionId === assignment.questionId);
      const solution = solutionRows.find((item) => item.questionId === assignment.questionId);
      if (!question || !answer || !solution) throw new Error("INCOMPLETE_RESULT");
      return {
        questionId: question.id,
        number: assignment.displayOrder,
        part: question.part,
        text: question.text,
        options: optionRows.filter((option) => option.questionId === question.id).sort((a, b) => a.displayOrder - b.displayOrder).map((option) => ({ id: option.id, key: option.optionKey, text: option.optionText })),
        selectedOptionId: answer.selectedOptionId,
        correctOptionId: solution.correctOptionId,
        isCorrect: answer.isCorrect,
        explanationEn: solution.explanationEn,
        explanationVi: solution.explanationVi,
      };
    }),
  };
}

export async function savePracticeAnswerWithTx(tx: Transaction, input: { userId: string; sessionId: string; questionId: string; selectedOptionId: string; responseTimeMs?: number }) {
  const [session] = await tx.select({ id: practiceSessions.id, status: practiceSessions.status, source: practiceSessions.source, practiceType: practiceSessions.practiceType })
    .from(practiceSessions).where(and(eq(practiceSessions.id, input.sessionId), eq(practiceSessions.userId, input.userId))).for("update").limit(1);
  if (!session || session.practiceType === "demo_test" || ["diagnostic", "full_mock", "ranked_challenge"].includes(session.source)) throw new Error("NOT_FOUND");
  if (session.status !== "in_progress") throw new Error("SESSION_CLOSED");
  const [assigned] = await tx.select({ questionId: practiceSessionQuestions.questionId }).from(practiceSessionQuestions)
    .where(and(eq(practiceSessionQuestions.sessionId, input.sessionId), eq(practiceSessionQuestions.questionId, input.questionId))).limit(1);
  if (!assigned) throw new Error("QUESTION_NOT_ASSIGNED");
  const [option] = await tx.select({ id: questionOptions.id }).from(questionOptions)
    .where(and(eq(questionOptions.id, input.selectedOptionId), eq(questionOptions.questionId, input.questionId))).limit(1);
  if (!option) throw new Error("OPTION_NOT_ASSIGNED");
  const now = new Date();
  await tx.insert(practiceAnswerDrafts).values({ ...input, updatedAt: now }).onConflictDoUpdate({
    target: [practiceAnswerDrafts.sessionId, practiceAnswerDrafts.questionId],
    set: { selectedOptionId: input.selectedOptionId, responseTimeMs: input.responseTimeMs ?? null, updatedAt: now },
  });
  return now;
}

export async function submitPracticeSessionWithTx(tx: Transaction, owner: Owner, sessionId: string, suppliedAnswers?: SubmittedAnswer[]) {
  const [session] = await tx.select().from(practiceSessions).where(ownerCondition(sessionId, owner)).for("update").limit(1);
  if (!session || session.practiceType === "demo_test" || ["diagnostic", "full_mock", "ranked_challenge"].includes(session.source)) throw new Error("NOT_FOUND");
  if (session.status === "submitted") return { alreadySubmitted: true, result: await submittedResult(tx, sessionId) };
  if (session.status !== "in_progress" || (session.expiresAt && session.expiresAt <= new Date())) throw new Error("NOT_FOUND");

  const assigned = await tx.select().from(practiceSessionQuestions).where(eq(practiceSessionQuestions.sessionId, sessionId));
  if (assigned.length !== session.questionCount) throw new Error("INCOMPLETE_ASSIGNMENT");
  const questionIds = assigned.map((row) => row.questionId);
  let answers: SubmittedAnswer[];
  if (suppliedAnswers) {
    if (suppliedAnswers.length > 30 || new Set(suppliedAnswers.map((answer) => answer.questionId)).size !== suppliedAnswers.length) throw new Error("INVALID_ANSWERS");
    answers = suppliedAnswers;
  } else {
    const drafts = await tx.select().from(practiceAnswerDrafts).where(and(eq(practiceAnswerDrafts.sessionId, sessionId), eq(practiceAnswerDrafts.userId, owner.userId!)));
    answers = drafts.map((draft) => ({ questionId: draft.questionId, selectedOptionId: draft.selectedOptionId, responseTimeMs: draft.responseTimeMs ?? undefined }));
  }
  if (answers.some((answer) => !questionIds.includes(answer.questionId))) throw new Error("QUESTION_NOT_ASSIGNED");

  const solutions = await tx.select().from(questionSolutions).where(inArray(questionSolutions.questionId, questionIds));
  const options = await tx.select().from(questionOptions).where(inArray(questionOptions.questionId, questionIds));
  const solutionMap = new Map(solutions.map((solution) => [solution.questionId, solution.correctOptionId]));
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
  let correct = 0;
  const now = new Date();
  const rows = assigned.map((assignment) => {
    const answer = answerMap.get(assignment.questionId);
    const selectedOptionId = answer?.selectedOptionId ?? null;
    if (selectedOptionId && !options.some((option) => option.id === selectedOptionId && option.questionId === assignment.questionId)) throw new Error("OPTION_NOT_ASSIGNED");
    const correctOptionId = solutionMap.get(assignment.questionId);
    if (!correctOptionId) throw new Error("MISSING_SOLUTION");
    const isCorrect = evaluateMultipleChoice({ type: "MULTIPLE_CHOICE", selectedOptionId }, correctOptionId).isCorrect;
    if (isCorrect) correct += 1;
    return { sessionId, userId: "userId" in owner ? owner.userId! : null, questionId: assignment.questionId, responseType: "MULTIPLE_CHOICE", selectedOptionId, isCorrect, responseTimeMs: answer?.responseTimeMs ?? null, answeredAt: selectedOptionId ? now : null };
  });
  await tx.insert(attemptAnswers).values(rows);
  await reconcileMasteryAnswers(tx, "userId" in owner ? owner.userId! : null, session.source, rows.map((row) => ({ ...row, masteryTargetQuestionId: assigned.find((item) => item.questionId === row.questionId)?.masteryTargetQuestionId })));
  await tx.update(practiceSessions).set({ status: "submitted", submittedAt: now, scoreCorrect: correct, scoreTotal: session.questionCount }).where(and(eq(practiceSessions.id, sessionId), eq(practiceSessions.status, "in_progress")));
  await awardCompletedLearning(tx, { userId: "userId" in owner ? owner.userId! : null, sourceType: "PRACTICE_SESSION", sourceId: sessionId, questionIds, completion: session.source === "recommended" ? "WORKOUT" : session.source === "mastery_review" ? "MASTERY" : undefined });
  await tx.delete(practiceAnswerDrafts).where(eq(practiceAnswerDrafts.sessionId, sessionId));
  return { alreadySubmitted: false, result: await submittedResult(tx, sessionId) };
}

export function submitPracticeSession(owner: Owner, sessionId: string, answers?: SubmittedAnswer[]) {
  return db.transaction((tx) => submitPracticeSessionWithTx(tx, owner, sessionId, answers));
}
