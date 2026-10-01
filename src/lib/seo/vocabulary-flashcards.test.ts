import { describe, expect, it } from "vitest";
import { TOEIC_VOCABULARY_FLASHCARDS } from "./vocabulary-flashcards";

describe("TOEIC workplace vocabulary flashcards", () => {
  it("keeps every flashcard original, complete and uniquely addressable", () => {
    expect(TOEIC_VOCABULARY_FLASHCARDS.length).toBe(8);
    expect(new Set(TOEIC_VOCABULARY_FLASHCARDS.map(card => card.id)).size).toBe(8);
    for (const card of TOEIC_VOCABULARY_FLASHCARDS) {
      expect(card.question.trim()).not.toBe("");
      expect(card.answer.trim()).not.toBe("");
      expect(card.phrase.trim()).not.toBe("");
      expect(card.explanation.trim()).not.toBe("");
    }
  });
});
