"use server";

import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { questionSolutions } from "@/db/schema";
import { getWordFormQuestions } from "@/lib/seo/word-form";

export type WordFormResult = { id: string; correctOptionId: string; explanation: string }[];

export async function gradeWordFormQuiz(questionIds: string[], selectedOptionIds: string[]): Promise<WordFormResult> {
  if (!Array.isArray(questionIds) || !Array.isArray(selectedOptionIds) || questionIds.length !== 5 || selectedOptionIds.length !== 5 || new Set(questionIds).size !== 5) {
    throw new Error("Cần trả lời đủ 5 câu.");
  }
  const current = await getWordFormQuestions();
  if (current.length !== 5 || current.some((question, index) =>
    question.id !== questionIds[index] || !question.options.some((option) => option.id === selectedOptionIds[index]),
  )) throw new Error("Bộ câu hỏi đã thay đổi. Vui lòng tải lại trang.");

  const solutions = await db.select({
    questionId: questionSolutions.questionId,
    correctOptionId: questionSolutions.correctOptionId,
    explanationVi: questionSolutions.explanationVi,
    explanationEn: questionSolutions.explanationEn,
  }).from(questionSolutions).where(inArray(questionSolutions.questionId, questionIds));
  const byId = new Map(solutions.map((solution) => [solution.questionId, solution]));
  if (byId.size !== 5 || solutions.some((solution) => !solution.explanationVi && !solution.explanationEn)) throw new Error("Chưa thể chấm bài. Vui lòng thử lại sau.");
  return questionIds.map((id) => {
    const solution = byId.get(id)!;
    return { id, correctOptionId: solution.correctOptionId, explanation: solution.explanationVi || solution.explanationEn! };
  });
}
