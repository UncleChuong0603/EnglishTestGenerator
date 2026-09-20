import { describe, expect, it } from "vitest";
import { calculateToeicProgress } from "@/lib/progress/calculate";
import { eligibleBreakdownCounts, hasComparableMockHistory } from "./preview-policy";

describe("Premium preview policy", () => {
  it("does not claim analytics for small samples", () => {
    const progress = calculateToeicProgress([{ skillArea: "READING", part: 5, skill: "grammar", subskill: "verbs", attemptedCount: 4, correctCount: 3, latestAttemptAt: null }]);
    expect(eligibleBreakdownCounts(progress)).toEqual({ skillCount: 0, subskillCount: 0 });
  });
  it("uses the canonical analytics sample threshold", () => {
    const progress = calculateToeicProgress([{ skillArea: "READING", part: 5, skill: "grammar", subskill: "verbs", attemptedCount: 5, correctCount: 3, latestAttemptAt: null }]);
    expect(eligibleBreakdownCounts(progress)).toEqual({ skillCount: 1, subskillCount: 1 });
  });
  it("requires two mocks of the same mode", () => {
    expect(hasComparableMockHistory(["READING", "LISTENING"])).toBe(false);
    expect(hasComparableMockHistory(["READING", "READING"])).toBe(true);
  });
});
