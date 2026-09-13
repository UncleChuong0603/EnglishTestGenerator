import type { ReadingPart, ReadingPracticeMode } from "@/lib/practice/types";

export type PerformanceStatus = "No data" | "Early data" | "Needs Focus" | "Needs Improvement" | "Good" | "Strong";
export type Trend = "Improving" | "Stable" | "Declining" | "Not enough data";

export type PerformanceMetric = {
  name: string;
  part?: ReadingPart;
  skill?: string;
  attempted: number;
  correct: number;
  accuracy: number;
  recentAccuracy: number | null;
  status: PerformanceStatus;
  trend: Trend;
};

export type SkillAnalytics = PerformanceMetric & { subskills: PerformanceMetric[] };
export type PartAnalytics = { part: ReadingPart; title: string; metric: PerformanceMetric; skills: SkillAnalytics[] };

export type RecentSession = {
  id: string;
  submittedAt: string;
  correct: number;
  total: number;
  accuracy: number;
  mode: ReadingPracticeMode;
};

export type LearnerAnalytics = {
  totalAttempted: number;
  totalCorrect: number;
  overallAccuracy: number;
  recentAccuracy: number | null;
  trend: Trend;
  sessionCount: number;
  skills: PerformanceMetric[];
  subskills: PerformanceMetric[];
  parts: PerformanceMetric[];
  partDetails: PartAnalytics[];
  focusAreas: PerformanceMetric[];
  strongAreas: PerformanceMetric[];
  recentSessions: RecentSession[];
};

export type AnalyticsAttempt = {
  isCorrect: boolean;
  skill: string;
  subSkill: string;
  part: ReadingPart;
  answeredAt: string;
  sessionId: string;
};
