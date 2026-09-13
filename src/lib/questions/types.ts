import type {
  difficulties,
  part5Skills,
  part5SubSkills,
  passageTypes,
  passageSetTypes,
  questionStatuses,
  readingDocumentTypes,
  toeicParts,
} from "./constants";

export type ToeicPart = (typeof toeicParts)[number];
export type Difficulty = (typeof difficulties)[number];
export type QuestionStatus = (typeof questionStatuses)[number];
export type PassageType = (typeof passageTypes)[number];
export type Part5Skill = (typeof part5Skills)[number];
export type Part5SubSkill = (typeof part5SubSkills)[number];
export type PassageSetType = (typeof passageSetTypes)[number];
export type ReadingDocumentType = (typeof readingDocumentTypes)[number];
export type JsonObject = Record<string, unknown>;

export type PassageSet = {
  id: string;
  toeic_part: 6 | 7;
  set_type: PassageSetType;
  title: string;
  metadata: JsonObject;
  status: QuestionStatus;
  created_at: string;
  updated_at: string;
};

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
  passage_set_id: string | null;
  position: number | null;
  document_type: ReadingDocumentType | null;
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
  passage_set_id: string | null;
  question_order: number;
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

/** Complete learner-safe Part 6/7 group. Solutions are intentionally absent. */
export type LearnerPassageSet = PassageSet & {
  passages: Passage[];
  questions: LearnerQuestion[];
};
