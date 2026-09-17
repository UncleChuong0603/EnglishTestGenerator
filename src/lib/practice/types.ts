export type PracticeOption = {
  id: string;
  key: string;
  text: string;
};

export type { ReadingPart } from "@/lib/toeic/domain";
import type { ListeningPart, ReadingPart } from "@/lib/toeic/domain";
export type ReadingPracticeMode = "part_5" | "part_6" | "part_7" | "mixed_reading";
export type ListeningPracticeMode = "listening_part_1" | "listening_part_2" | "listening_part_3" | "listening_part_4";
export type PracticeMode = ReadingPracticeMode | ListeningPracticeMode;
export type ReadingSessionMode = ReadingPracticeMode | "demo_test";
export type PracticeSource = "recommended" | "custom" | "guest" | "diagnostic" | "mastery_review" | "full_mock";

export type PracticePassage = {
  id: string;
  title: string | null;
  content: string;
  position: number;
  documentType: string;
};

/** Learner-safe DTO. It deliberately contains no solution or explanation fields. */
export type PracticeQuestion = {
  id: string;
  number: number;
  part: ReadingPart | ListeningPart;
  text: string;
  skill: string;
  subSkill: string;
  options: PracticeOption[];
  passageSetId: string | null;
  media?: { id: string; kind: "AUDIO" | "IMAGE"; url: string; alt: string }[];
};

export type PracticeGroup = {
  id: string;
  part: ReadingPart | ListeningPart;
  setType: "standalone" | "part6" | "single" | "double" | "triple" | "photographs" | "question_response" | "conversation" | "talk";
  title: string | null;
  passages: PracticePassage[];
  questions: PracticeQuestion[];
};

export type SubmittedAnswer = {
  questionId: string;
  responseType?: "MULTIPLE_CHOICE";
  selectedOptionId: string | null;
  responseTimeMs?: number;
};

export type PracticeSession = {
  id: string;
  status: "in_progress";
  questionCount: number;
  requestedQuestionCount: number;
  mode: PracticeMode;
  skillArea: "READING" | "LISTENING";
  source: PracticeSource;
  requestedSkill: string | null;
  requestedSubSkill: string | null;
  questions: PracticeQuestion[];
  groups: PracticeGroup[];
};

export type ReviewQuestion = PracticeQuestion & {
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanationEn: string | null;
  explanationVi: string | null;
  transcript?: string;
};

export type PracticeResult = {
  id: string;
  mode: PracticeMode;
  skillArea: "READING" | "LISTENING";
  source: PracticeSource;
  requestedSkill: string | null;
  requestedSubSkill: string | null;
  requestedQuestionCount: number;
  scoreCorrect: number;
  scoreTotal: number;
  submittedAt: string;
  questions: ReviewQuestion[];
  groups: Array<Omit<PracticeGroup, "questions"> & { questions: ReviewQuestion[] }>;
};

export type PracticeConfig = {
  mode: ReadingPracticeMode;
  skill?: string;
  subSkill?: string;
  targetQuestionCount: 10 | 15 | 20;
  source: PracticeSource;
};

export type ReadingRecommendation = PracticeConfig & {
  part: ReadingPart | null;
  accuracy: number | null;
  recentAccuracy: number | null;
  attemptCount: number;
  trend: "Improving" | "Stable" | "Declining" | "Not enough data";
  focusLevel: "subskill" | "skill" | "part" | "mixed";
  availableQuestionCount: number;
  reason: string;
};
