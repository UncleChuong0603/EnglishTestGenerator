import { describe, expect, it } from "vitest";
import { calculateToeicProgress, progressAccuracy } from "./calculate";
import type { ProgressAggregateRow } from "./types";

const row = (overrides: Partial<ProgressAggregateRow>): ProgressAggregateRow => ({ skillArea: "LISTENING", part: 1, skill: "inference", subskill: "speaker_intent", attemptedCount: 1, correctCount: 1, latestAttemptAt: "2026-09-16T00:00:00.000Z", ...overrides });

describe("unified TOEIC progress", () => {
  it("represents no data separately from a real zero percent", () => {
    expect(progressAccuracy(0, 0)).toBeNull();
    expect(progressAccuracy(1, 1)).toBe(100);
    expect(progressAccuracy(0, 1)).toBe(0);
    expect(progressAccuracy(2, 3)).toBe(67);
  });

  it("aggregates Parts 1-4 by child question and keeps all seven parts", () => {
    const progress = calculateToeicProgress([
      row({ part: 1 }), row({ part: 2, correctCount: 0 }), row({ part: 3, attemptedCount: 3, correctCount: 2 }), row({ part: 4, attemptedCount: 3, correctCount: 1 }),
    ]);
    expect(progress.listening).toMatchObject({ attemptedCount: 8, correctCount: 4, accuracy: 50 });
    expect(progress.listening.parts.map((part) => [part.part, part.attemptedCount, part.accuracy])).toEqual([[1, 1, 100], [2, 1, 0], [3, 3, 67], [4, 3, 33]]);
    expect(progress.parts).toHaveLength(7);
    expect(progress.reading.accuracy).toBeNull();
  });

  it("separates mixed Listening and Reading history, including same-named skills", () => {
    const progress = calculateToeicProgress([
      row({ skillArea: "LISTENING", part: 3, attemptedCount: 3, correctCount: 2 }),
      row({ skillArea: "READING", part: 5, subskill: "context", attemptedCount: 4, correctCount: 1 }),
      row({ skillArea: "READING", part: 6, skill: "grammar", subskill: "tense", attemptedCount: 2, correctCount: 2 }),
      row({ skillArea: "READING", part: 7, skill: "detail", subskill: "fact", attemptedCount: 1, correctCount: 1 }),
    ]);
    expect(progress.listening).toMatchObject({ attemptedCount: 3, correctCount: 2 });
    expect(progress.reading).toMatchObject({ attemptedCount: 7, correctCount: 4 });
    expect(progress.reading.parts.map((part) => [part.part, part.attemptedCount])).toEqual([[5, 4], [6, 2], [7, 1]]);
    expect(progress.attemptedCount).toBe(10);
    expect(progress.listening.skills.find((skill) => skill.name === "inference")?.attemptedCount).toBe(3);
    expect(progress.reading.skills.find((skill) => skill.name === "inference")?.attemptedCount).toBe(4);
  });
});
