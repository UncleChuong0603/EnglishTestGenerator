import "server-only";

import { loadRecommendedWorkout, isListeningPart } from "@/lib/diagnosis/service";
import { getUsageStatus } from "@/lib/entitlements/service";
import { getLearnerGoal } from "@/lib/goals/service";
import { getDailyWorkload, getGroupSafeWorkoutSize } from "@/lib/workout/policy";
import {
  createListeningPracticeSession,
  createMasteryReviewSession,
  createReadingPracticeSession,
  createRecommendedListeningPracticeSession,
  createRecommendedReadingPracticeSession,
} from "./selector";
import type { PracticeConfig, ReadingPracticeMode } from "./types";

function readingQuestionCount(value: number): PracticeConfig["targetQuestionCount"] {
  return value >= 20 ? 20 : value >= 15 ? 15 : 10;
}

export type PracticeStartCommand =
  | { kind: "TODAYS_WORKOUT" }
  | { kind: "CUSTOM_READING"; config: PracticeConfig }
  | { kind: "CUSTOM_LISTENING"; part: 1 | 2 | 3 | 4; questionCount?: number }
  | { kind: "MASTERY_REVIEW"; part?: number; smart?: boolean; size?: number }
  | { kind: "WEEKLY_FOCUS" };

async function startTodaysWorkout(userId: string) {
  const [recommendation, goal, usage] = await Promise.all([
    loadRecommendedWorkout(userId),
    getLearnerGoal(userId),
    getUsageStatus(userId),
  ]);
  const workload = getDailyWorkload({ goal, plan: usage.effectivePlan, workoutUsage: usage.entitlements.TODAYS_WORKOUT });
  const safeSize = getGroupSafeWorkoutSize(recommendation.part, workload.targetQuestions);

  if (recommendation.skillArea === "LISTENING" && isListeningPart(recommendation.part)) {
    const count = recommendation.part >= 3 ? safeSize.groupCount! : safeSize.questionCount;
    return createRecommendedListeningPracticeSession(userId, {
      part: recommendation.part,
      skill: recommendation.primarySkill ?? undefined,
      subSkill: recommendation.primarySubskill ?? undefined,
      count,
    });
  }

  if (recommendation.skillArea === "READING") {
    const part = recommendation.part && recommendation.part >= 5 ? recommendation.part as 5 | 6 | 7 : null;
    if (part) {
      return createRecommendedReadingPracticeSession(userId, {
        part,
        skill: recommendation.primarySkill ?? undefined,
        subSkill: recommendation.primarySubskill ?? undefined,
        questionCount: safeSize.questionCount,
      });
    }
    return createReadingPracticeSession(userId, {
      mode: "mixed_reading",
      targetQuestionCount: readingQuestionCount(safeSize.questionCount),
      source: "recommended",
    });
  }

  throw new Error("NO_PUBLISHED_CONTENT");
}

async function startWeeklyFocus(userId: string) {
  const [recommendation, goal, usage] = await Promise.all([
    loadRecommendedWorkout(userId),
    getLearnerGoal(userId),
    getUsageStatus(userId),
  ]);
  const part = recommendation.part;
  if (usage.effectivePlan !== "PREMIUM") throw new Error("PREMIUM_REQUIRED");
  if (recommendation.reasonCode !== "SUPPORTED_WEAKNESS" || recommendation.skillArea !== "READING" || part === null || part < 5) {
    throw new Error("NOT_ENOUGH_HISTORY");
  }
  const workload = getDailyWorkload({ goal, plan: usage.effectivePlan, workoutUsage: usage.entitlements.TODAYS_WORKOUT });
  const size = getGroupSafeWorkoutSize(part, workload.targetQuestions);
  return createRecommendedReadingPracticeSession(userId, {
    part: part as 5 | 6 | 7,
    skill: recommendation.primarySkill ?? undefined,
    subSkill: recommendation.primarySubskill ?? undefined,
    questionCount: size.questionCount,
  }, "target_weakness");
}

/** Canonical start boundary used by web actions now and /api/v1 in Task 43. */
export async function startPractice(userId: string, command: PracticeStartCommand) {
  switch (command.kind) {
    case "TODAYS_WORKOUT":
      return startTodaysWorkout(userId);
    case "CUSTOM_READING":
      return createReadingPracticeSession(userId, command.config);
    case "CUSTOM_LISTENING": {
      const target = command.questionCount ?? (command.part === 1 ? 5 : command.part === 2 ? 10 : 3);
      return createListeningPracticeSession(userId, command.part, target);
    }
    case "MASTERY_REVIEW":
      return createMasteryReviewSession(userId, command.part, { smart: command.smart, size: command.size });
    case "WEEKLY_FOCUS":
      return startWeeklyFocus(userId);
  }
}

/** Converts the API-facing reading fields without accepting question IDs. */
export function readingConfig(part: 5 | 6 | 7 | null, questionCount: PracticeConfig["targetQuestionCount"], skill?: string, subSkill?: string): PracticeConfig {
  return {
    mode: (part ? `part_${part}` : "mixed_reading") as ReadingPracticeMode,
    targetQuestionCount: questionCount,
    source: "custom",
    skill,
    subSkill,
  };
}
