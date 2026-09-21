import type { PlanKey } from "@/lib/entitlements/catalog";
import type { GoalProfile } from "@/lib/goals/domain";
import type { ToeicPart } from "@/lib/toeic/domain";

type WorkoutUsage = { type: "UNLIMITED"; used: number; resetAt: null } | { type: "LIMITED"; used: number; limit: number; remaining: number; resetAt: string };

export const DEFAULT_DAILY_STUDY_MINUTES = 20;

const QUESTION_TARGET_BY_MINUTES = {
  10: 10,
  20: 10,
  30: 15,
  45: 20,
  60: 20,
} as const;

export type DailyWorkload = {
  studyMinutes: keyof typeof QUESTION_TARGET_BY_MINUTES;
  targetQuestions: number;
  approximateMinutes: number;
  plan: PlanKey;
  workoutAvailable: boolean;
};

export function getDailyWorkload(input: {
  goal: GoalProfile | null;
  plan: PlanKey;
  workoutUsage: WorkoutUsage;
}): DailyWorkload {
  const requested = input.goal?.dailyStudyMinutes ?? DEFAULT_DAILY_STUDY_MINUTES;
  const studyMinutes = requested in QUESTION_TARGET_BY_MINUTES
    ? requested as keyof typeof QUESTION_TARGET_BY_MINUTES
    : DEFAULT_DAILY_STUDY_MINUTES;
  return {
    studyMinutes,
    targetQuestions: QUESTION_TARGET_BY_MINUTES[studyMinutes],
    approximateMinutes: studyMinutes,
    plan: input.plan,
    workoutAvailable: input.workoutUsage.type === "UNLIMITED" || input.workoutUsage.remaining > 0,
  };
}

export function getGroupSafeWorkoutSize(part: ToeicPart | null, targetQuestions: number) {
  if (part === 3 || part === 4) {
    const groupCount = Math.max(1, Math.round(targetQuestions / 3));
    return { questionCount: groupCount * 3, groupCount };
  }
  return { questionCount: targetQuestions, groupCount: null };
}

export function dailyGoalProgress(completedQuestions: number, targetQuestions: number) {
  const completed = Math.max(0, completedQuestions);
  const target = Math.max(1, targetQuestions);
  return {
    completedQuestions: completed,
    targetQuestions: target,
    remainingQuestions: Math.max(0, target - completed),
    percent: Math.min(100, Math.round((completed / target) * 100)),
    complete: completed >= target,
  };
}

export type DashboardLifecycle = "NEW" | "DIAGNOSED" | "ACTIVE" | "RESUMABLE" | "DAILY_GOAL_COMPLETE";

export function getDashboardLifecycle(input: {
  recommendDiagnostic: boolean;
  hasResumablePractice: boolean;
  dailyGoalComplete: boolean;
  completedLearningSessions: number;
}): DashboardLifecycle {
  if (input.recommendDiagnostic) return "NEW";
  if (input.hasResumablePractice) return "RESUMABLE";
  if (input.dailyGoalComplete) return "DAILY_GOAL_COMPLETE";
  return input.completedLearningSessions > 0 ? "ACTIVE" : "DIAGNOSED";
}
