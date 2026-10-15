import { describe, expect, it } from "vitest";
import { practiceListening, task60RecoveryListening } from "./content-manifest.mjs";
import { practiceReading, task60PracticeReadingRecovery } from "./practice-reading-data.mjs";

describe("Task 60 practice capacity recovery", () => {
  it("adds only the listening capacity displaced by mock remediation", () => {
    const questionsByPart = Object.fromEntries([2, 3, 4].map(part => [
      part,
      task60RecoveryListening
        .filter(item => item.part === part)
        .reduce((total, item) => total + (item.questions?.length ?? 1), 0),
    ]));

    expect(task60RecoveryListening).toHaveLength(78);
    expect(questionsByPart).toEqual({ 2: 17, 3: 81, 4: 102 });
    expect(new Set(task60RecoveryListening.map(item => item.externalId)).size).toBe(78);
    expect(task60RecoveryListening.some(item => practiceListening.some(existing => existing.externalId === item.externalId))).toBe(false);
  });

  it("adds one independent four-question Part 6 set", () => {
    expect(task60PracticeReadingRecovery.sets).toHaveLength(1);
    expect(task60PracticeReadingRecovery.sets[0].questions).toHaveLength(4);
    expect(task60PracticeReadingRecovery.sets[0].toeicPart).toBe(6);
    expect(practiceReading.sets.some(existing => existing.key === task60PracticeReadingRecovery.sets[0].key)).toBe(false);
  });
});
