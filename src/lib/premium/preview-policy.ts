import { MIN_ATTEMPTS_FOR_CLASSIFICATION } from "@/lib/analytics/calculate";
import type { ToeicProgress } from "@/lib/progress/types";

export const PREMIUM_PREVIEW_POLICY = {
  analyticsMinimumAnswers: MIN_ATTEMPTS_FOR_CLASSIFICATION,
  comparableMockMinimum: 2,
} as const;

export function eligibleBreakdownCounts(progress: ToeicProgress) {
  const skills = progress.parts.flatMap((part) => part.skills);
  return {
    skillCount: skills.filter((skill) => skill.attemptedCount >= PREMIUM_PREVIEW_POLICY.analyticsMinimumAnswers).length,
    subskillCount: skills.flatMap((skill) => skill.subskills).filter((subskill) => subskill.attemptedCount >= PREMIUM_PREVIEW_POLICY.analyticsMinimumAnswers).length,
  };
}

export function hasComparableMockHistory(modes: string[]) {
  const counts = new Map<string, number>();
  for (const mode of modes) counts.set(mode, (counts.get(mode) ?? 0) + 1);
  return [...counts.values()].some((count) => count >= PREMIUM_PREVIEW_POLICY.comparableMockMinimum);
}
