export const difficulties = ["B1", "B2", "C1"] as const;
export const focuses = ["mixed", "vocabulary", "main_idea", "detail", "inference"] as const;
export const skills = ["vocabulary", "main_idea", "detail", "inference", "reference", "purpose_tone"] as const;
export const answerKeys = ["A", "B", "C", "D"] as const;

export type Difficulty = (typeof difficulties)[number];
export type Focus = (typeof focuses)[number];
export type Skill = (typeof skills)[number];
export type AnswerKey = (typeof answerKeys)[number];

export type QuestionOption = { key: AnswerKey; text: string };
export type ReadingQuestion = {
  id: string;
  question_order: number;
  question: string;
  options: QuestionOption[];
  skill: Skill;
  sub_skill: string;
  difficulty: Difficulty;
};
export type ReadingTest = {
  id: string;
  title: string;
  passage: string;
  difficulty: Difficulty;
  focus: Focus;
  question_count: number;
};
export type AttemptAnswer = {
  question_id: string;
  selected_answer: AnswerKey | null;
  is_correct: boolean;
};
