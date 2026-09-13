import type { PracticeGroup, PracticeQuestion, ReviewQuestion } from "@/lib/practice/types";

export type DemoSubmissionReason = "manual" | "time_expired";

export type DemoTestSession = {
  id: string;
  status: "in_progress";
  startedAt: string;
  expiresAt: string;
  questionCount: 100;
  questions: PracticeQuestion[];
  groups: PracticeGroup[];
  answers: Record<string, string>;
};

export type DemoPartResult = { part: 5 | 6 | 7; correct: number; total: number; accuracy: number };

export type DemoTestResult = {
  id: string;
  startedAt: string;
  submittedAt: string;
  expiresAt: string;
  submissionReason: DemoSubmissionReason;
  scoreCorrect: number;
  scoreTotal: number;
  timeUsedSeconds: number;
  partResults: DemoPartResult[];
  questions: ReviewQuestion[];
  groups: Array<Omit<PracticeGroup, "questions"> & { questions: ReviewQuestion[] }>;
};

export type DemoSelectionUnit = {
  id: string;
  part: 5 | 6 | 7;
  setType: "standalone" | "part6" | "single" | "double" | "triple";
  questionIds: string[];
};

