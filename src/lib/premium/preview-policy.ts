import { MIN_ATTEMPTS_FOR_CLASSIFICATION } from "@/lib/analytics/calculate";
import type { ToeicProgress } from "@/lib/progress/types";
import type { PremiumLifecycle } from "./lifecycle";

export type PremiumValueKey =
  | "analytics"
  | "smartReview"
  | "smartPriority"
  | "mockHistory"
  | "reassessment"
  | "targeting";

export type PremiumProgressPreview = {
  answeredCount: number;
  eligibleSkillCount: number;
  eligibleSubskillCount: number;
  hasSkillBreakdownPotential: boolean;
};

export type PremiumMistakePreview = {
  unresolvedCount: number;
  repeatedMistakeCount: number;
  reviewableCount: number;
};

export type PremiumMockPreview = {
  completedCount: number;
  hasComparableHistory: boolean;
};

export const PREMIUM_PREVIEW_POLICY = {
  analyticsMinimumAnswers: MIN_ATTEMPTS_FOR_CLASSIFICATION,
  comparableMockMinimum: 2,
} as const;

export function eligibleBreakdownCounts(progress: ToeicProgress) {
  const skills = progress.parts.flatMap((part) => part.skills);
  return {
    skillCount: skills.filter(
      (skill) =>
        skill.attemptedCount >= PREMIUM_PREVIEW_POLICY.analyticsMinimumAnswers,
    ).length,
    subskillCount: skills
      .flatMap((skill) => skill.subskills)
      .filter(
        (subskill) =>
          subskill.attemptedCount >=
          PREMIUM_PREVIEW_POLICY.analyticsMinimumAnswers,
      ).length,
  };
}

export function isFreeConversionLifecycle(lifecycle: PremiumLifecycle) {
  return lifecycle === "FREE";
}

export function progressPreviewFrom(
  progress: ToeicProgress,
): PremiumProgressPreview {
  const breakdown = eligibleBreakdownCounts(progress);
  return {
    answeredCount: progress.attemptedCount,
    eligibleSkillCount: breakdown.skillCount,
    eligibleSubskillCount: breakdown.subskillCount,
    hasSkillBreakdownPotential:
      breakdown.skillCount > 0 || breakdown.subskillCount > 0,
  };
}

export function hasComparableMockHistory(modes: string[]) {
  const counts = new Map<string, number>();
  for (const mode of modes) counts.set(mode, (counts.get(mode) ?? 0) + 1);
  return hasComparableMockHistoryCounts(
    [...counts].map(([mode, completedCount]) => ({ mode, completedCount })),
  );
}

export function hasComparableMockHistoryCounts(
  counts: Array<{ mode: string; completedCount: number }>,
) {
  return counts.some(
    ({ completedCount }) =>
      completedCount >= PREMIUM_PREVIEW_POLICY.comparableMockMinimum,
  );
}

export function mockPreviewFrom(
  counts: Array<{ mode: string; completedCount: number }>,
): PremiumMockPreview {
  return {
    completedCount: counts.reduce(
      (sum, item) => sum + item.completedCount,
      0,
    ),
    hasComparableHistory: hasComparableMockHistoryCounts(counts),
  };
}

export function premiumValuesFrom(input: {
  progress: PremiumProgressPreview;
  mistakes: PremiumMistakePreview;
  mock: PremiumMockPreview;
  hasBaseline: boolean;
}): PremiumValueKey[] {
  const values: PremiumValueKey[] = [];
  if (input.progress.hasSkillBreakdownPotential) values.push("analytics");
  if (input.mistakes.unresolvedCount > 0) values.push("smartReview");
  if (input.mistakes.repeatedMistakeCount > 0)
    values.push("smartPriority");
  if (input.mock.hasComparableHistory) values.push("mockHistory");
  if (input.hasBaseline) values.push("reassessment");
  if (input.progress.answeredCount > 0) values.push("targeting");
  return values;
}
