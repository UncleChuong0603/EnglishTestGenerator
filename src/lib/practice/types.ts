export type PracticeOption = {
  id: string;
  key: string;
  text: string;
};

/** Learner-safe DTO. It deliberately contains no solution or explanation fields. */
export type PracticeQuestion = {
  id: string;
  number: number;
  part: 5;
  text: string;
  skill: string;
  subSkill: string;
  options: PracticeOption[];
};

export type SubmittedAnswer = {
  questionId: string;
  selectedOptionId: string | null;
  responseTimeMs?: number;
};

export type PracticeSession = {
  id: string;
  status: "in_progress";
  questionCount: number;
  questions: PracticeQuestion[];
};

export type ReviewQuestion = PracticeQuestion & {
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanationEn: string | null;
  explanationVi: string | null;
};

export type PracticeResult = {
  id: string;
  scoreCorrect: number;
  scoreTotal: number;
  submittedAt: string;
  questions: ReviewQuestion[];
};
