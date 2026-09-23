import "server-only";
import { getPublishedQuestionsByPart } from "@/lib/questions/queries";

export type WordFormQuestion = {
  id: string;
  text: string;
  options: { id: string; key: string; text: string }[];
};

export async function getWordFormQuestions(): Promise<WordFormQuestion[]> {
  const questions = await getPublishedQuestionsByPart(5, 100, { skill: "grammar", subSkill: "word_form" });
  return questions.filter((question) =>
    question.response_type === "MULTIPLE_CHOICE" &&
    question.passage_id === null &&
    question.question_text.trim().length > 0 &&
    question.options.length === 4,
  ).slice(0, 5).map((question) => ({
    id: question.id,
    text: question.question_text,
    options: question.options.map((option) => ({ id: option.id, key: option.option_key, text: option.option_text })),
  }));
}
