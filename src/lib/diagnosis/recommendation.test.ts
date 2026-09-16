import { describe, expect, it } from "vitest";
import { calculateToeicDiagnosis } from "./calculate";
import { recommendWorkout } from "./recommendation";
import { calculateToeicProgress } from "../progress/calculate";

const context = { recentPractice: { LISTENING: 0, READING: 0 }, availableParts: { LISTENING: [1, 2, 3, 4], READING: [5, 6, 7] } } as const;
describe("unified workout recommendation", () => {
  it("gives a new learner an exploration workout", () => { const result = recommendWorkout(calculateToeicDiagnosis(calculateToeicProgress([])), context); expect(result.kind).toBe("EXPLORATION"); expect(result.reasonCode).toBe("BUILD_PROFILE"); expect(result.evidence).toBeNull(); });
  it("chooses a supported weakness and exposes the 60/20/20 mix", () => { const diagnosis = calculateToeicDiagnosis(calculateToeicProgress([{ skillArea: "READING", part: 7, skill: "inference", subskill: "author_intent", attemptedCount: 15, correctCount: 6, latestAttemptAt: null }])); const result = recommendWorkout(diagnosis, context); expect(result).toMatchObject({ kind: "FOCUSED", skillArea: "READING", part: 7, selectionMix: { primary: 60, support: 20, maintenance: 20 } }); });
  it("reports whole-group sizing for Listening Parts 3 and 4", () => { for (const part of [3, 4] as const) { const diagnosis = calculateToeicDiagnosis(calculateToeicProgress([{ skillArea: "LISTENING", part, skill: "intent", subskill: "speaker_intent", attemptedCount: 12, correctCount: 4, latestAttemptAt: null }])); expect(recommendWorkout(diagnosis, context)).toMatchObject({ part, questionCount: 9, groupCount: 3 }); } });
  it("uses recent section balance as a deterministic tie-break influence", () => { const diagnosis = calculateToeicDiagnosis(calculateToeicProgress([{ skillArea: "LISTENING", part: 2, skill: "detail", subskill: "detail", attemptedCount: 10, correctCount: 5, latestAttemptAt: null }, { skillArea: "READING", part: 5, skill: "grammar", subskill: "tense", attemptedCount: 10, correctCount: 5, latestAttemptAt: null }])); const result = recommendWorkout(diagnosis, { ...context, recentPractice: { LISTENING: 8, READING: 0 } }); expect(result.skillArea).toBe("READING"); });
});
