import { describe, expect, it } from "vitest";
import { hasMeaningfulLearning, TRIAL_DURATION_MS, trialEndsAt } from "./trial-policy";

describe("three day trial policy", () => {
  it("requires two learning days and twenty distinct answers", () => {
    expect(hasMeaningfulLearning(0, 0)).toBe(false);
    expect(hasMeaningfulLearning(1, 20)).toBe(false);
    expect(hasMeaningfulLearning(2, 19)).toBe(false);
    expect(hasMeaningfulLearning(2, 20)).toBe(true);
  });

  it("expires after exactly 72 hours", () => {
    const start = new Date("2026-09-29T16:00:00.000Z");
    expect(trialEndsAt(start).getTime() - start.getTime()).toBe(TRIAL_DURATION_MS);
    expect(trialEndsAt(start).toISOString()).toBe("2026-10-02T16:00:00.000Z");
  });
});
