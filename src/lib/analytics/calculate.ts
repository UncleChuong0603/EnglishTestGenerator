import type { AnalyticsAttempt, PerformanceMetric, PerformanceStatus } from "./types";

export const MIN_ATTEMPTS_FOR_CLASSIFICATION = 5;

export const PERFORMANCE_THRESHOLDS = {
  weak: 50,
  needsImprovement: 70,
  good: 85,
} as const;

export function percentage(correct: number, attempted: number) {
  return attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
}

export function classifyPerformance(attempted: number, accuracy: number): PerformanceStatus {
  if (attempted < MIN_ATTEMPTS_FOR_CLASSIFICATION) return "Not enough data";
  if (accuracy < PERFORMANCE_THRESHOLDS.weak) return "Weak";
  if (accuracy < PERFORMANCE_THRESHOLDS.needsImprovement) return "Needs improvement";
  if (accuracy < PERFORMANCE_THRESHOLDS.good) return "Good";
  return "Strong";
}

export function aggregatePerformance(
  attempts: AnalyticsAttempt[],
  field: "skill" | "subSkill",
): PerformanceMetric[] {
  const groups = new Map<string, { attempted: number; correct: number }>();

  for (const attempt of attempts) {
    const name = attempt[field].trim() || "Other";
    const current = groups.get(name) ?? { attempted: 0, correct: 0 };
    current.attempted += 1;
    current.correct += attempt.isCorrect ? 1 : 0;
    groups.set(name, current);
  }

  return [...groups.entries()]
    .map(([name, values]) => {
      const accuracy = percentage(values.correct, values.attempted);
      return { name, ...values, accuracy, status: classifyPerformance(values.attempted, accuracy) };
    })
    .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted || a.name.localeCompare(b.name));
}
