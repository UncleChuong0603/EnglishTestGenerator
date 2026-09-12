import type {
  difficulties,
  passageTypes,
  questionStatuses,
  toeicParts,
} from "./constants";

export type ToeicPart = (typeof toeicParts)[number];
export type Difficulty = (typeof difficulties)[number];
export type QuestionStatus = (typeof questionStatuses)[number];
export type PassageType = (typeof passageTypes)[number];
export type JsonObject = Record<string, unknown>;

export type Passage = {
  id: string;
  toeic_part: ToeicPart;
  passage_type: PassageType;
  title: string | null;
  content: string | null;
  audio_url: string | null;
  image_url: string | null;
  metadata: JsonObject;
  status: QuestionStatus;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  toeic_part: ToeicPart;
  question_type: string;
  skill: string;
  sub_skill: string;
  difficulty: Difficulty;
  question_text: string;
  passage_id: string | null;
  audio_url: string | null;
  image_url: string | null;
  metadata: JsonObject;
  status: QuestionStatus;
  created_at: string;
  updated_at: string;
};

export type QuestionOption = {
  id: string;
  question_id: string;
  option_key: string;
  option_text: string;
  display_order: number;
  created_at: string;
};

/** Server-only shape. Do not include it in learner question payloads. */
export type QuestionSolution = {
  question_id: string;
  correct_option_id: string;
  explanation_en: string | null;
  explanation_vi: string | null;
  created_at: string;
  updated_at: string;
};

export type LearnerQuestion = Question & {
  options: QuestionOption[];
  passage?: Passage | null;
};
