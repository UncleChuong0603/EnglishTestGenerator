import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnswerReviewCard } from "./answer-review-card";
import type { ReviewQuestion } from "@/lib/practice/types";

const baseQuestion: ReviewQuestion = {
  id: "question-1", number: 1, part: 5, text: "Please _____ the form.", skill: "GRAMMAR", subSkill: "VERB_FORM", passageSetId: null,
  options: [{ id: "a", key: "A", text: "fills" }, { id: "b", key: "B", text: "fill out" }],
  selectedOptionId: "b", correctOptionId: "b", isCorrect: true, explanationEn: "Use the base verb.", explanationVi: "Dùng động từ nguyên mẫu.",
};

describe("answer review density and language", () => {
  it("keeps a correct answer compact with a collapsed native disclosure", () => {
    const html = renderToStaticMarkup(<AnswerReviewCard explanationLanguage="en" locale="en" question={baseQuestion} />);
    expect(html).toContain("<details"); expect(html).not.toContain("<details open"); expect(html).toContain("Show explanation"); expect(html).toContain("B. fill out");
    expect(html).not.toContain("Your answer");
  });

  it("expands incorrect comparison and renders only the preferred language", () => {
    const question = { ...baseQuestion, selectedOptionId: "a", isCorrect: false };
    const html = renderToStaticMarkup(<AnswerReviewCard explanationLanguage="vi" locale="vi" question={question} />);
    expect(html).toContain("Câu trả lời của bạn"); expect(html).toContain("Đáp án đúng"); expect(html).toContain("Dùng động từ nguyên mẫu.");
    expect(html).not.toContain("Use the base verb."); expect(html).not.toContain("<details");
  });
});
