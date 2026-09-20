import "server-only";
import { cache } from "react";
import { getDiagnosticEligibility } from "@/lib/diagnostic/service";
import { getMembershipState, getUsageStatus } from "@/lib/entitlements/service";
import { getFullMockHistory } from "@/lib/full-mock/service";
import { getMistakeOverview } from "@/lib/mastery/queries";
import { getToeicProgress } from "@/lib/progress/queries";
import { getPremiumLifecycle } from "./lifecycle";
import { eligibleBreakdownCounts, hasComparableMockHistory } from "./preview-policy";

export type PremiumValueKey = "analytics" | "smartReview" | "smartPriority" | "mockHistory" | "reassessment" | "targeting";
export type PremiumPreviewData = {
  visible: boolean;
  lifecycle: ReturnType<typeof getPremiumLifecycle>;
  progress: { answeredCount: number; eligibleSkillCount: number; eligibleSubskillCount: number; hasSkillBreakdownPotential: boolean };
  mistakes: { unresolvedCount: number; repeatedMistakeCount: number; reviewableCount: number };
  mock: { completedCount: number; hasComparableHistory: boolean };
  diagnostic: { hasBaseline: boolean };
  usage: Awaited<ReturnType<typeof getUsageStatus>>["entitlements"];
  values: PremiumValueKey[];
};

/** Current-user presentation summary only; raw answers and records never leave server services. */
export const getPremiumPreview = cache(async (userId: string): Promise<PremiumPreviewData> => {
  const [membership, progress, mistakes, mocks, diagnostic, usage] = await Promise.all([
    getMembershipState(userId),
    getToeicProgress(userId),
    getMistakeOverview(userId),
    getFullMockHistory(userId),
    getDiagnosticEligibility(userId),
    getUsageStatus(userId),
  ]);
  const lifecycle = getPremiumLifecycle(membership);
  const breakdown = eligibleBreakdownCounts(progress);
  const values: PremiumValueKey[] = [];
  if (breakdown.skillCount > 0 || breakdown.subskillCount > 0) values.push("analytics");
  if (mistakes.unresolvedCount > 0) values.push("smartReview");
  if (mistakes.repeatedMistakeCount > 0) values.push("smartPriority");
  if (hasComparableMockHistory(mocks.flatMap((mock) => mock ? [mock.mode] : []))) values.push("mockHistory");
  if (diagnostic.status !== "NEEDS_BASELINE") values.push("reassessment");
  if (progress.attemptedCount > 0) values.push("targeting");
  return {
    visible: lifecycle === "FREE",
    lifecycle,
    progress: { answeredCount: progress.attemptedCount, eligibleSkillCount: breakdown.skillCount, eligibleSubskillCount: breakdown.subskillCount, hasSkillBreakdownPotential: breakdown.skillCount > 0 || breakdown.subskillCount > 0 },
    mistakes: { unresolvedCount: mistakes.unresolvedCount, repeatedMistakeCount: mistakes.repeatedMistakeCount, reviewableCount: mistakes.reviewableCount },
    mock: { completedCount: mocks.filter(Boolean).length, hasComparableHistory: values.includes("mockHistory") },
    diagnostic: { hasBaseline: diagnostic.status !== "NEEDS_BASELINE" },
    usage: usage.entitlements,
    values,
  };
});
