import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TRIAL_DURATION_DAYS, TRIAL_DURATION_MS, trialEndsAt } from "./trial-policy";

describe("thirty day trial policy", () => {
  it("keeps the trial migration after the latest existing migration", () => {
    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: Array<{ idx: number; when: number; tag: string }> };
    const previous = journal.entries.find(entry => entry.tag === "0043_simple_chat");
    const trial = journal.entries.find(entry => entry.tag === "0044_cooing_pet_avengers");
    expect(trial?.idx).toBe((previous?.idx ?? -2) + 1);
    expect(trial?.when).toBeGreaterThan(previous?.when ?? 0);
  });
  it("expires after exactly 30 days across month boundaries", () => {
    const start = new Date("2026-09-29T16:00:00.000Z");
    expect(trialEndsAt(start).getTime() - start.getTime()).toBe(TRIAL_DURATION_MS);
    expect(TRIAL_DURATION_DAYS).toBe(30);
    expect(TRIAL_DURATION_MS).toBe(30 * 86_400_000);
    expect(trialEndsAt(start).toISOString()).toBe("2026-10-29T16:00:00.000Z");
  });
});
