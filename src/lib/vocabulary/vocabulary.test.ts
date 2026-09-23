import { describe, expect, it } from "vitest";
import { matchingVocabulary, vocabularySuggestions } from "./catalog";
import { nextVocabularySchedule } from "./schedule";

describe("TOEIC vocabulary", () => {
  it("matches complete terms and phrases, including completed cloze answers", () => {
    expect(matchingVocabulary("Please pay the invoice.").map((entry) => entry.key)).toContain("invoice");
    expect(matchingVocabulary("The uninvoiced amount changed.")).toEqual([]);
    expect(vocabularySuggestions("Please _____ by Friday.", "submit").map((entry) => entry.key)).toContain("submit");
    expect(matchingVocabulary("The application was submitted yesterday.").map((entry) => entry.key)).toContain("submit");
    expect(matchingVocabulary("The request was approved.").map((entry) => entry.key)).toContain("approve");
    expect(vocabularySuggestions("We must meet a deadline.", "").map((entry) => entry.key)).toContain("meet-a-deadline");
  });

  it("finds a word in a reading passage when the question has none", () => {
    expect(vocabularySuggestions("What is the purpose of the notice?", "To inform staff", ["The shipment arrived yesterday."]).map((entry) => entry.key)).toContain("shipment");
  });

  it("schedules remembered words later and missed words soon", () => {
    const now = new Date("2026-09-23T00:00:00.000Z");
    expect(nextVocabularySchedule(0, true, now)).toEqual({ intervalDays: 1, dueAt: new Date("2026-09-24T00:00:00.000Z") });
    expect(nextVocabularySchedule(20, true, now).intervalDays).toBe(30);
    expect(nextVocabularySchedule(4, false, now)).toEqual({ intervalDays: 0, dueAt: new Date("2026-09-23T00:10:00.000Z") });
  });
});
