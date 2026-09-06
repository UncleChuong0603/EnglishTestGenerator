export const difficulties = ["B1", "B2", "C1"] as const;
export const skills = ["vocabulary", "main_idea", "detail", "inference", "reference"] as const;
export const answerKeys = ["A", "B", "C", "D"] as const;

export type Difficulty = (typeof difficulties)[number];
export type Skill = (typeof skills)[number];
export type AnswerKey = (typeof answerKeys)[number];
export type QuestionOption = { key: AnswerKey; text: string };

export type QuestionCandidate = {
  id: string;
  passageId: string;
  skill: Skill;
  previousUses: number;
};

export type ReadingQuestion = {
  id: string;
  passage_id: string;
  passage_title: string;
  passage_content: string;
  question_order: number;
  question: string;
  options: QuestionOption[];
  skill: Skill;
  sub_skill: string | null;
  topic: string;
  difficulty: Difficulty;
};
