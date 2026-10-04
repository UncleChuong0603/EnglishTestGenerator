import { describe, expect, it } from "vitest";
import { selectRetentionKind, shouldRemovePushDevice } from "./policy";

const preferences = { todaysWorkout: true, vocabularyDue: true, unresolvedReview: true, weeklyReview: true };

describe("native retention policy", () => {
  it("honors granular opt-outs and sends nothing when no enabled need exists", () => {
    expect(selectRetentionKind({ preferences: { ...preferences, vocabularyDue: false }, vietnamWeekday: 1, dueVocabulary: 5, unresolvedMistakes: 0, completedQuestionsToday: 4 })).toBeNull();
    expect(selectRetentionKind({ preferences, vietnamWeekday: 1, dueVocabulary: 5, unresolvedMistakes: 3, completedQuestionsToday: 0 })).toBe("VOCAB_DUE");
  });

  it("prioritizes a weekly review on Sunday", () => {
    expect(selectRetentionKind({ preferences, vietnamWeekday: 0, dueVocabulary: 5, unresolvedMistakes: 3, completedQuestionsToday: 0 })).toBe("WEEKLY_REVIEW");
  });

  it("revokes only tokens confirmed unregistered by the provider", () => {
    expect(shouldRemovePushDevice("DeviceNotRegistered")).toBe(true);
    expect(shouldRemovePushDevice("MessageRateExceeded")).toBe(false);
    expect(shouldRemovePushDevice(undefined)).toBe(false);
  });
});
