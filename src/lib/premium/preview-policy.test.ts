import { describe, expect, it } from "vitest";
import { calculateToeicProgress } from "@/lib/progress/calculate";
import {
  eligibleBreakdownCounts,
  hasComparableMockHistory,
  hasComparableMockHistoryCounts,
  isFreeConversionLifecycle,
  mockPreviewFrom,
  premiumValuesFrom,
  progressPreviewFrom,
} from "./preview-policy";

describe("Premium preview policy", () => {
  it("does not claim analytics for small samples", () => {
    const progress = calculateToeicProgress([
      {
        skillArea: "READING",
        part: 5,
        skill: "grammar",
        subskill: "verbs",
        attemptedCount: 4,
        correctCount: 3,
        latestAttemptAt: null,
      },
    ]);
    expect(eligibleBreakdownCounts(progress)).toEqual({
      skillCount: 0,
      subskillCount: 0,
    });
  });
  it("uses the canonical analytics sample threshold", () => {
    const progress = calculateToeicProgress([
      {
        skillArea: "READING",
        part: 5,
        skill: "grammar",
        subskill: "verbs",
        attemptedCount: 5,
        correctCount: 3,
        latestAttemptAt: null,
      },
    ]);
    expect(eligibleBreakdownCounts(progress)).toEqual({
      skillCount: 1,
      subskillCount: 1,
    });
  });
  it("requires two mocks of the same mode", () => {
    expect(hasComparableMockHistory(["READING", "LISTENING"])).toBe(false);
    expect(hasComparableMockHistory(["READING", "READING"])).toBe(true);
    expect(
      hasComparableMockHistoryCounts([
        { mode: "READING", completedCount: 1 },
        { mode: "LISTENING", completedCount: 1 },
      ]),
    ).toBe(false);
    expect(
      mockPreviewFrom([{ mode: "READING", completedCount: 2 }]),
    ).toEqual({ completedCount: 2, hasComparableHistory: true });
  });
  it("builds values only from evidence that exists", () => {
    const emptyProgress = calculateToeicProgress([]);
    const progress = progressPreviewFrom(emptyProgress);
    expect(progress).toMatchObject({
      answeredCount: 0,
      hasSkillBreakdownPotential: false,
    });
    expect(
      premiumValuesFrom({
        progress,
        mistakes: {
          unresolvedCount: 0,
          repeatedMistakeCount: 0,
          reviewableCount: 0,
        },
        mock: { completedCount: 0, hasComparableHistory: false },
        hasBaseline: false,
      }),
    ).toEqual([]);
    expect(
      premiumValuesFrom({
        progress: { ...progress, answeredCount: 3 },
        mistakes: {
          unresolvedCount: 2,
          repeatedMistakeCount: 1,
          reviewableCount: 2,
        },
        mock: { completedCount: 2, hasComparableHistory: true },
        hasBaseline: true,
      }),
    ).toEqual([
      "smartReview",
      "smartPriority",
      "mockHistory",
      "reassessment",
      "targeting",
    ]);
  });
  it("shows conversion messaging only for genuinely Free accounts", () => {
    expect(isFreeConversionLifecycle("FREE")).toBe(true);
    expect(isFreeConversionLifecycle("ACTIVE_NORMAL")).toBe(false);
    expect(isFreeConversionLifecycle("ACTIVE_EXPIRING_SOON")).toBe(false);
    expect(isFreeConversionLifecycle("ACTIVE_EXPIRING_VERY_SOON")).toBe(false);
    expect(isFreeConversionLifecycle("EXPIRED")).toBe(false);
  });
});
