import { describe, expect, it } from "vitest";
import { createVocabularyQuizQuestion } from "./quiz";

describe("vocabulary meaning quiz", () => {
  it("uses four distinct answer meanings even when the pool contains duplicates", () => {
    const entries = [
      { key: "agenda", term: "agenda", meaningVi: "chương trình họp", meaningEn: "meeting agenda", kind: "word" as const },
      { key: "memo", term: "memo", meaningVi: "bản ghi nhớ nội bộ", meaningEn: "internal memo", kind: "word" as const },
      { key: "notice", term: "notice", meaningVi: "bản ghi nhớ nội bộ", meaningEn: "internal memo", kind: "word" as const },
      { key: "invoice", term: "invoice", meaningVi: "hóa đơn", meaningEn: "invoice", kind: "word" as const },
      { key: "shipment", term: "shipment", meaningVi: "lô hàng", meaningEn: "shipment", kind: "word" as const },
    ];

    const question = createVocabularyQuizQuestion(entries, "vi", () => 0);

    expect(question?.options).toHaveLength(4);
    expect(new Set(question?.options.map((option) => option.text)).size).toBe(4);
    expect(question?.options.find((option) => option.id === question.correctOptionId)?.text).toBe("chương trình họp");
  });
});
