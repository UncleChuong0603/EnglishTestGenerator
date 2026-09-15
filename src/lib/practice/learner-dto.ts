import type { PracticeQuestion } from "./types";

export type LearnerQuestionSource = {
  id: string; displayOrder: number; toeicPart: number; questionText: string; skill: string; subSkill: string; passageSetId: string | null;
  options: ReadonlyArray<{ id: string; optionKey: string; optionText: string }>;
};

/** Allowlist mapper: privileged fields on a wider DB/domain object are structurally ignored. */
export function toLearnerPracticeQuestion(source: LearnerQuestionSource): PracticeQuestion {
  if (![1, 2, 5, 6, 7].includes(source.toeicPart)) throw new Error("UNSUPPORTED_LEARNER_QUESTION_PART");
  const listening = source.toeicPart <= 2;
  return { id: source.id, number: source.displayOrder, part: source.toeicPart as PracticeQuestion["part"], text: listening ? "" : source.questionText, skill: source.skill, subSkill: source.subSkill, passageSetId: source.passageSetId, options: source.options.map((option) => ({ id: option.id, key: option.optionKey, text: listening ? "" : option.optionText })) };
}
