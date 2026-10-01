import { describe, expect, it } from "vitest";
import { PUBLIC_TOEIC_VOCABULARY_ENTRIES, PUBLIC_TOEIC_VOCABULARY_TOPICS } from "./public-vocabulary";

describe("public TOEIC vocabulary collection", () => {
  it("contains ten reviewed topics and one hundred complete entries", () => {
    expect(PUBLIC_TOEIC_VOCABULARY_TOPICS).toHaveLength(10);
    expect(PUBLIC_TOEIC_VOCABULARY_ENTRIES).toHaveLength(100);
    expect(new Set(PUBLIC_TOEIC_VOCABULARY_ENTRIES.map((entry) => entry.key)).size).toBe(100);
    expect(PUBLIC_TOEIC_VOCABULARY_ENTRIES.every((entry) => entry.term && entry.meaningVi && entry.meaningEn && entry.example)).toBe(true);
  });
});
