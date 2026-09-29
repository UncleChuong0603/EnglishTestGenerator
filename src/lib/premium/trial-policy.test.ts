import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { hasMeaningfulLearning, TRIAL_DURATION_MS, trialEndsAt } from "./trial-policy";

describe("three day trial policy", () => {
  it("keeps the trial migration after the latest existing migration", () => {
    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: Array<{ idx: number; when: number; tag: string }> };
    const previous = journal.entries.find(entry => entry.tag === "0043_simple_chat");
    const trial = journal.entries.find(entry => entry.tag === "0044_cooing_pet_avengers");
    expect(trial?.idx).toBe((previous?.idx ?? -2) + 1);
    expect(trial?.when).toBeGreaterThan(previous?.when ?? 0);
  });
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
