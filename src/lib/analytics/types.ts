export type PerformanceStatus = "Not enough data" | "Weak" | "Needs improvement" | "Good" | "Strong";

export type PerformanceMetric = {
  name: string;
  attempted: number;
  correct: number;
  accuracy: number;
  status: PerformanceStatus;
};

export type RecentSession = {
  id: string;
  submittedAt: string;
  correct: number;
  total: number;
  accuracy: number;
};

export type LearnerAnalytics = {
  totalAttempted: number;
  totalCorrect: number;
  overallAccuracy: number;
  sessionCount: number;
  skills: PerformanceMetric[];
  subskills: PerformanceMetric[];
  focusAreas: PerformanceMetric[];
  recentSessions: RecentSession[];
};

export type AnalyticsAttempt = {
  isCorrect: boolean;
  skill: string;
  subSkill: string;
};
