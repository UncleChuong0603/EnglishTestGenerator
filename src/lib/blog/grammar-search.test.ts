import { describe, expect, it } from "vitest";
import { filterGrammarUnits, grammarSearchTerms, normalizeGrammarSearch, type SearchableGrammarUnit } from "./grammar-search";

const units: SearchableGrammarUnit[] = [
  {
    id: "foundation",
    title: "Nền tảng",
    intro: "Các chủ điểm nền tảng",
    lessons: [
      { slug: "dai-tu-va-tu-han-dinh-toeic", label: "Đại từ và từ hạn định", summary: "Chọn đại từ phù hợp.", number: 1, searchTerms: grammarSearchTerms("dai-tu-va-tu-han-dinh-toeic") },
      { slug: "so-sanh-va-luong-tu-toeic", label: "So sánh và lượng từ", summary: "So sánh các đối tượng.", number: 2, searchTerms: grammarSearchTerms("so-sanh-va-luong-tu-toeic") },
      { slug: "menh-de-quan-he-toeic", label: "Mệnh đề quan hệ", summary: "Chọn từ quan hệ.", number: 3, searchTerms: grammarSearchTerms("menh-de-quan-he-toeic") },
    ],
  },
];

describe("grammar lesson search", () => {
  it("matches English grammar signals", () => {
    expect(filterGrammarUnits(units, "her")[0]?.lessons.map((lesson) => lesson.slug)).toEqual(["dai-tu-va-tu-han-dinh-toeic"]);
    expect(filterGrammarUnits(units, "more than")[0]?.lessons.map((lesson) => lesson.slug)).toEqual(["so-sanh-va-luong-tu-toeic"]);
    expect(filterGrammarUnits(units, "who")[0]?.lessons.map((lesson) => lesson.slug)).toEqual(["menh-de-quan-he-toeic"]);
  });

  it("matches Vietnamese lesson names with or without diacritics", () => {
    expect(normalizeGrammarSearch("Mệnh đề quan hệ")).toBe("menh de quan he");
    expect(filterGrammarUnits(units, "menh de quan he")[0]?.lessons.map((lesson) => lesson.slug)).toEqual(["menh-de-quan-he-toeic"]);
  });

  it("returns no units when no lesson matches", () => {
    expect(filterGrammarUnits(units, "past perfect")).toEqual([]);
  });
});
