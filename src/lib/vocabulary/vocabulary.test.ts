import { describe, expect, it } from "vitest";
import { matchingVocabulary, vocabularyCatalog, vocabularySuggestions } from "./catalog";
import { vocabularyStudyTopics } from "./study-list";
import { nextVocabularySchedule } from "./schedule";

describe("TOEIC vocabulary", () => {
  it("matches complete terms and phrases, including completed cloze answers", () => {
    expect(matchingVocabulary("Please pay the invoice.").map((entry) => entry.key)).toContain("invoice");
    expect(matchingVocabulary("The uninvoiced amount changed.").map((entry) => entry.key)).not.toContain("invoice");
    expect(vocabularySuggestions("Please _____ by Friday.", "submit").map((entry) => entry.key)).toContain("submit");
    expect(matchingVocabulary("The application was submitted yesterday.").map((entry) => entry.key)).toContain("submit");
    expect(matchingVocabulary("The request was approved.").map((entry) => entry.key)).toContain("approve");
    expect(vocabularySuggestions("We must meet a deadline.", "").map((entry) => entry.key)).toContain("meet-a-deadline");
  });

  it("finds a word in a reading passage when the question has none", () => {
    expect(vocabularySuggestions("What is the purpose of the notice?", "To inform staff", ["The shipment arrived yesterday."]).map((entry) => entry.key)).toContain("shipment");
  });

  it("keeps the answer term visible when a question includes other catalog terms", () => {
    expect(vocabularySuggestions("The schedule and invoice mention a _____.", "refund")[0].key).toBe("refund");
  });

  it("has 1000 unique study terms, with the first ten topics fully illustrated", () => {
    expect(vocabularyStudyTopics).toHaveLength(19);
    expect(vocabularyCatalog).toHaveLength(1000);
    expect(new Set(vocabularyCatalog.map((entry) => entry.key)).size).toBe(1000);
    for (const topic of vocabularyStudyTopics) {
      expect(topic.entries).toHaveLength(topic.id.startsWith("frequent-") ? 100 : 10);
      for (const entry of topic.entries) {
        expect(entry.meaningVi.length).toBeGreaterThan(1);
        expect(entry.meaningEn.length).toBeGreaterThan(1);
        if (entry.example) expect(entry.example.length).toBeGreaterThan(15);
      }
    }
  });

  it("schedules remembered words later and missed words soon", () => {
    const now = new Date("2026-09-23T00:00:00.000Z");
    expect(nextVocabularySchedule(0, true, now)).toEqual({ intervalDays: 1, dueAt: new Date("2026-09-24T00:00:00.000Z") });
    expect(nextVocabularySchedule(20, true, now).intervalDays).toBe(30);
    expect(nextVocabularySchedule(4, false, now)).toEqual({ intervalDays: 0, dueAt: new Date("2026-09-23T00:10:00.000Z") });
  });
});
