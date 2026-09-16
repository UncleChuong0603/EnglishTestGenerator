import { describe, expect, it } from "vitest";
import { calculateToeicDiagnosis } from "../diagnosis/calculate";
import { recommendWorkout } from "../diagnosis/recommendation";
import { en } from "../i18n/en";
import { vi } from "../i18n/vi";
import { calculateToeicProgress } from "../progress/calculate";
import type { ProgressAggregateRow } from "../progress/types";

const context = { recentPractice: { LISTENING: 0, READING: 0 }, availableParts: { LISTENING: [1, 2, 3, 4], READING: [5, 6, 7] } } as const;
const row = (overrides: Partial<ProgressAggregateRow>): ProgressAggregateRow => ({ skillArea: "LISTENING", part: 1, skill: "detail", subskill: "detail", attemptedCount: 1, correctCount: 1, latestAttemptAt: null, ...overrides });

describe("Today's Workout dashboard model", () => {
  it("shows profile building for a new learner without fabricating a weakness", () => {
    const progress = calculateToeicProgress([]);
    const recommendation = recommendWorkout(calculateToeicDiagnosis(progress), context);
    expect(recommendation).toMatchObject({ kind: "EXPLORATION", reasonCode: "BUILD_PROFILE", evidence: null });
    expect(en.workout.reasonBuild).not.toMatch(/weakest/i);
  });

  it("represents an early signal as uncertain exploration", () => {
    const progress = calculateToeicProgress([row({ part: 2, attemptedCount: 4, correctCount: 1 })]);
    const recommendation = recommendWorkout(calculateToeicDiagnosis(progress), context);
    expect(recommendation).toMatchObject({ kind: "EXPLORATION", reasonCode: "EARLY_EXPLORATION", evidence: null });
    expect(en.workout.reasonEarly).toMatch(/more practice/i);
  });

  it("renders supported Listening grouping metadata and Reading targeting", () => {
    const listening = recommendWorkout(calculateToeicDiagnosis(calculateToeicProgress([row({ part: 3, skill: "intent", subskill: "speaker_intent", attemptedCount: 12, correctCount: 3 })])), context);
    const reading = recommendWorkout(calculateToeicDiagnosis(calculateToeicProgress([row({ skillArea: "READING", part: 7, skill: "inference", subskill: "implied_information", attemptedCount: 12, correctCount: 4 })])), context);
    expect(listening).toMatchObject({ kind: "FOCUSED", skillArea: "LISTENING", part: 3, questionCount: 9, groupCount: 3, reasonCode: "SUPPORTED_WEAKNESS" });
    expect(reading).toMatchObject({ kind: "FOCUSED", skillArea: "READING", part: 7, questionCount: 10, reasonCode: "SUPPORTED_WEAKNESS" });
    expect(vi.workout.reasonSupported).toBeTruthy();
  });

  it.each([
    ["Listening only", [row({ attemptedCount: 2, correctCount: 1 })], 50, null],
    ["Reading only", [row({ skillArea: "READING", part: 5, attemptedCount: 4, correctCount: 0 })], null, 0],
    ["Mixed", [row({ attemptedCount: 2, correctCount: 1 }), row({ skillArea: "READING", part: 6, attemptedCount: 2, correctCount: 2 })], 50, 100],
  ])("keeps no-data distinct from 0%% for %s", (_name, rows, listening, reading) => {
    const progress = calculateToeicProgress(rows as ProgressAggregateRow[]);
    expect(progress.listening.accuracy).toBe(listening);
    expect(progress.reading.accuracy).toBe(reading);
  });
});
