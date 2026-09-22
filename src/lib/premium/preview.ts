import "server-only";
import { cache } from "react";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { fullMockRuns } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { hasCompletedDiagnostic } from "@/lib/diagnostic/service";
import { getMembershipState, getUsageStatus } from "@/lib/entitlements/service";
import { getMistakeOverview } from "@/lib/mastery/queries";
import { getToeicProgress } from "@/lib/progress/queries";
import { getPremiumLifecycle } from "./lifecycle";
import {
  mockPreviewFrom,
  premiumValuesFrom,
  progressPreviewFrom,
  type PremiumValueKey,
} from "./preview-policy";

export type { PremiumValueKey } from "./preview-policy";
export type PremiumPreviewData = {
  visible: boolean;
  lifecycle: ReturnType<typeof getPremiumLifecycle>;
  progress: {
    answeredCount: number;
    eligibleSkillCount: number;
    eligibleSubskillCount: number;
    hasSkillBreakdownPotential: boolean;
  };
  mistakes: {
    unresolvedCount: number;
    repeatedMistakeCount: number;
    reviewableCount: number;
  };
  mock: { completedCount: number; hasComparableHistory: boolean };
  diagnostic: { hasBaseline: boolean };
  usage: Awaited<ReturnType<typeof getUsageStatus>>["entitlements"];
  values: PremiumValueKey[];
};

/** Current-user presentation summary only; raw answers and records never leave server services. */
export const getPremiumPreview = cache(
  async (): Promise<PremiumPreviewData> => {
    const user = await requireUser();
    const userId = user.id;
    const [membership, progress, mistakes, mocks, diagnostic, usage] =
      await Promise.all([
        getMembershipState(userId),
        getToeicProgress(userId),
        getMistakeOverview(userId),
        db
          .select({
            mode: fullMockRuns.mode,
            completedCount: count(fullMockRuns.id),
          })
          .from(fullMockRuns)
          .where(
            and(
              eq(fullMockRuns.userId, userId),
              eq(fullMockRuns.status, "COMPLETED"),
            ),
          )
          .groupBy(fullMockRuns.mode),
        hasCompletedDiagnostic(userId),
        getUsageStatus(userId),
      ]);
    const lifecycle = getPremiumLifecycle(membership);
    const progressPreview = progressPreviewFrom(progress);
    const mistakePreview = {
      unresolvedCount: mistakes.unresolvedCount,
      repeatedMistakeCount: mistakes.repeatedMistakeCount,
      reviewableCount: mistakes.reviewableCount,
    };
    const mockPreview = mockPreviewFrom(
      mocks.map((mock) => ({
        mode: mock.mode,
        completedCount: Number(mock.completedCount),
      })),
    );
    const values = premiumValuesFrom({
      progress: progressPreview,
      mistakes: mistakePreview,
      mock: mockPreview,
      hasBaseline: diagnostic,
    });
    return {
      visible: lifecycle === "FREE",
      lifecycle,
      progress: progressPreview,
      mistakes: mistakePreview,
      mock: mockPreview,
      diagnostic: { hasBaseline: diagnostic },
      usage: usage.entitlements,
      values,
    };
  },
);
