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
  type PracticeTransaction,
} from "./selector";
import type { PracticeConfig, ReadingPracticeMode } from "./types";

export type PracticeStartCommand =
  | { kind: "TODAYS_WORKOUT" }
  | { kind: "CUSTOM_READING"; config: PracticeConfig }
  | { kind: "CUSTOM_LISTENING"; part: 1 | 2 | 3 | 4; questionCount?: number }
  | { kind: "MASTERY_REVIEW"; part?: number; smart?: boolean; size?: number }
  | { kind: "WEEKLY_FOCUS" };

async function startTodaysWorkout(userId: string, transaction?: PracticeTransaction) {
  const [recommendation, goal, usage] = await Promise.all([
    loadRecommendedWorkout(userId),
    getLearnerGoal(userId),
    getUsageStatus(userId),
  ]);
  const workload = getDailyWorkload({ goal, plan: usage.effectivePlan, workoutUsage: usage.entitlements.TODAYS_WORKOUT });
  const safeSize = getGroupSafeWorkoutSize(recommendation.part, workload.targetQuestions);

  if (recommendation.skillArea === "LISTENING" && isListeningPart(recommendation.part)) {
    const count = recommendation.part >= 3 ? safeSize.groupCount! : safeSize.questionCount;
    const target = {
      part: recommendation.part,
      skill: recommendation.primarySkill ?? undefined,
      subSkill: recommendation.primarySubskill ?? undefined,
      count,
    };
    return transaction
      ? createRecommendedListeningPracticeSession(userId, target, transaction)
      : createRecommendedListeningPracticeSession(userId, target);
  }

  if (recommendation.skillArea === "READING") {
    const part = recommendation.part && recommendation.part >= 5 ? recommendation.part as 5 | 6 | 7 : null;
    if (part) {
      const target = {
        part,
        skill: recommendation.primarySkill ?? undefined,
        subSkill: recommendation.primarySubskill ?? undefined,
        questionCount: safeSize.questionCount,
      };
      return transaction
        ? createRecommendedReadingPracticeSession(userId, target, "recommended", transaction)
        : createRecommendedReadingPracticeSession(userId, target);
    }
    const config: PracticeConfig = {
      mode: "mixed_reading",
      targetQuestionCount: 10,
      source: "recommended",
    };
    return transaction
      ? createReadingPracticeSession(userId, config, false, transaction)
      : createReadingPracticeSession(userId, config);
  }

  throw new Error("NO_PUBLISHED_CONTENT");
}

async function startWeeklyFocus(userId: string, transaction?: PracticeTransaction) {
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
  const target = {
    part: part as 5 | 6 | 7,
    skill: recommendation.primarySkill ?? undefined,
    subSkill: recommendation.primarySubskill ?? undefined,
    questionCount: size.questionCount,
  };
  return transaction
    ? createRecommendedReadingPracticeSession(userId, target, "target_weakness", transaction)
    : createRecommendedReadingPracticeSession(userId, target, "target_weakness");
}

/** Canonical start boundary used by web actions now and /api/v1 in Task 43. */
export async function startPractice(userId: string, command: PracticeStartCommand, transaction?: PracticeTransaction) {
  switch (command.kind) {
    case "TODAYS_WORKOUT":
      return startTodaysWorkout(userId, transaction);
    case "CUSTOM_READING":
      return transaction
        ? createReadingPracticeSession(userId, command.config, false, transaction)
        : createReadingPracticeSession(userId, command.config);
    case "CUSTOM_LISTENING": {
      const target = command.questionCount ?? (command.part === 1 ? 5 : command.part === 2 ? 10 : 3);
      return transaction
        ? createListeningPracticeSession(userId, command.part, target, transaction)
        : createListeningPracticeSession(userId, command.part, target);
    }
    case "MASTERY_REVIEW":
      return transaction
        ? createMasteryReviewSession(userId, command.part, { smart: command.smart, size: command.size }, transaction)
        : createMasteryReviewSession(userId, command.part, { smart: command.smart, size: command.size });
    case "WEEKLY_FOCUS":
      return startWeeklyFocus(userId, transaction);
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
