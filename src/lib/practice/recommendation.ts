import "server-only";

import { getLearnerAnalytics } from "@/lib/analytics/queries";
import type { LearnerAnalytics, PerformanceMetric } from "@/lib/analytics/types";
import { createAdminClient } from "@/lib/supabase/admin";

import { MIN_RECOMMENDATION_ATTEMPTS, MIN_RECOMMENDATION_QUESTIONS_AVAILABLE } from "./constants";
import { recommendationScore } from "./selection";
import { getAvailableReadingQuestionCount } from "./selector";
import type { ReadingPart, ReadingRecommendation } from "./types";

type FocusLevel = Exclude<ReadingRecommendation["focusLevel"], "mixed">;
type Candidate = {
  metric: PerformanceMetric;
  part: ReadingPart;
  skill?: string;
  subSkill?: string;
  focusLevel: FocusLevel;
  availableQuestionCount: number;
};
type AvailableRow = { toeic_part: number; skill: string; sub_skill: string };

type RecommendationQueryError = {
  code?: string;
  message?: string;
};

async function loadAvailableRows(): Promise<AvailableRow[] | null> {
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error("Could not initialize recommendation data access", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await admin.from("questions")
        .select("toeic_part, skill, sub_skill")
        .in("toeic_part", [5, 6, 7])
        .eq("status", "published");

      if (!error) return (data ?? []) as AvailableRow[];

      const safeError = error as RecommendationQueryError;
      console.error("Could not load published questions for recommendation", {
        attempt: attempt + 1,
        code: safeError.code ?? "unknown",
        message: safeError.message ?? "Unknown Supabase error",
      });
    } catch (error) {
      console.error("Recommendation query request failed", {
        attempt: attempt + 1,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return null;
}

export async function getReadingRecommendation(
  userId: string,
  suppliedAnalytics?: LearnerAnalytics,
): Promise<ReadingRecommendation> {
  const analytics = suppliedAnalytics ?? await getLearnerAnalytics(userId);

  const levels: Array<{ level: FocusLevel; metrics: PerformanceMetric[] }> = [
    { level: "subskill", metrics: analytics.subskills },
    { level: "skill", metrics: analytics.skills },
    { level: "part", metrics: analytics.parts },
  ];

  // New learners do not have enough evidence for a focused recommendation.
  // Avoid an unnecessary database request and return the balanced starting point.
  if (!levels.some(({ metrics }) => metrics.some((metric) =>
    metric.part && metric.attempted >= MIN_RECOMMENDATION_ATTEMPTS,
  ))) {
    return defaultRecommendation();
  }

  // A recommendation is helpful but must never make the dashboard unavailable.
  // Retry one transient Supabase failure, then degrade to balanced practice.
  const available = await loadAvailableRows();
  if (!available) return defaultRecommendation();

  for (const { level, metrics } of levels) {
    const ranked = metrics.filter((metric) => metric.part && metric.attempted >= MIN_RECOMMENDATION_ATTEMPTS)
      .map((metric): Candidate => {
        const part = metric.part!;
        const skill = level === "subskill" ? metric.skill : level === "skill" ? metric.name : undefined;
        const subSkill = level === "subskill" ? metric.name : undefined;
        const availableQuestionCount = available.filter((question) => question.toeic_part === part
          && (!skill || question.skill === skill) && (!subSkill || question.sub_skill === subSkill)).length;
        return { metric, part, skill, subSkill, focusLevel: level, availableQuestionCount };
      })
      .filter((candidate) => candidate.availableQuestionCount >= MIN_RECOMMENDATION_QUESTIONS_AVAILABLE)
      .sort((a, b) => recommendationScore({ ...b.metric, availableQuestionCount: b.availableQuestionCount })
        - recommendationScore({ ...a.metric, availableQuestionCount: a.availableQuestionCount }));

    for (const candidate of ranked) {
      let verifiedCount: number;
      try {
        verifiedCount = await getAvailableReadingQuestionCount(candidate.part, candidate.skill, candidate.subSkill);
      } catch (error) {
        console.error("Could not verify recommendation content", {
          part: candidate.part,
          skill: candidate.skill,
          subSkill: candidate.subSkill,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        continue;
      }
      if (verifiedCount < MIN_RECOMMENDATION_QUESTIONS_AVAILABLE) continue;
      return recommendationFromCandidate({ ...candidate, availableQuestionCount: verifiedCount });
    }
  }
  return defaultRecommendation();
}

function recommendationFromCandidate(candidate: Candidate): ReadingRecommendation {
  const { metric } = candidate;
  const recent = metric.recentAccuracy === null ? "" : ` Your last ${Math.min(metric.attempted, 20)} answers in this area are ${metric.recentAccuracy}% correct.`;
  const trend = metric.trend === "Declining"
    ? " Recent performance is declining, so this deserves attention now."
    : metric.trend === "Improving"
      ? " You are improving; another focused session can reinforce that progress."
      : "";
  const opportunity = metric.status === "Strong"
    ? "This is your lowest-priority mastered area, so the session is for reinforcement."
    : "This is currently one of your highest-priority Reading opportunities.";
  return {
    mode: `part_${candidate.part}` as ReadingRecommendation["mode"],
    part: candidate.part,
    skill: candidate.skill,
    subSkill: candidate.subSkill,
    targetQuestionCount: 15,
    source: "recommended",
    accuracy: metric.accuracy,
    recentAccuracy: metric.recentAccuracy,
    attemptCount: metric.attempted,
    trend: metric.trend,
    focusLevel: candidate.focusLevel,
    availableQuestionCount: candidate.availableQuestionCount,
    reason: `You are ${metric.accuracy}% correct across ${metric.attempted} questions in this area.${recent}${trend} ${opportunity}`,
  };
}

function defaultRecommendation(): ReadingRecommendation {
  return {
    mode: "mixed_reading",
    part: null,
    targetQuestionCount: 15,
    source: "recommended",
    accuracy: null,
    recentAccuracy: null,
    attemptCount: 0,
    trend: "Not enough data",
    focusLevel: "mixed",
    availableQuestionCount: 0,
    reason: "We need more practice data to personalize your recommendation. Start with a balanced session covering Parts 5, 6, and 7.",
  };
}
