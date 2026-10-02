import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readingLongTailGuides } from "./reading-long-tail";

describe("Reading long-tail guides", () => {
  it("keeps every guide on a unique public route with valid original questions", () => {
    const guides = Object.values(readingLongTailGuides);
    expect(new Set(guides.map((guide) => guide.path)).size).toBe(guides.length);

    for (const guide of guides) {
      expect(existsSync(`src/app${guide.path}/page.tsx`), guide.path).toBe(true);
      expect(guide.documents.length).toBeGreaterThan(0);
      expect(guide.questions.length).toBeGreaterThan(0);
      for (const question of guide.questions) {
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.answer).toBeLessThan(4);
        expect(question.explanation.trim()).not.toBe("");
      }
    }
  });

  it("completes the Part 7 progression from one to three documents", () => {
    const single = readingLongTailGuides.singlePassage;
    expect(single.path).toBe("/toeic/part-7/doc-hieu-mot-doan-van");
    expect(single.documents).toHaveLength(1);
    expect(single.questions).toHaveLength(4);
    expect(single.related.some((link) => link.href === readingLongTailGuides.doublePassage.path)).toBe(true);
    expect(readingLongTailGuides.doublePassage.related.some((link) => link.href === single.path)).toBe(true);
    expect(readingLongTailGuides.triplePassage.related.some((link) => link.href === single.path)).toBe(true);
  });

  it("publishes a distinct paraphrase exercise with contextual evidence", () => {
    const guide = readingLongTailGuides.paraphrase;
    expect(guide.path).toBe("/toeic/part-7/paraphrase-tu-dong-nghia");
    expect(guide.documents).toHaveLength(3);
    expect(guide.questions).toHaveLength(6);
    expect(guide.questions.filter(question => question.prompt.includes("closest in meaning"))).toHaveLength(2);
    expect(guide.related.some(link => link.href === readingLongTailGuides.singlePassage.path)).toBe(true);
    expect(readingLongTailGuides.singlePassage.related.some(link => link.href === guide.path)).toBe(true);
    expect(readingLongTailGuides.doublePassage.related.some(link => link.href === guide.path)).toBe(true);
    expect(readingLongTailGuides.triplePassage.related.some(link => link.href === guide.path)).toBe(true);
  });
});
