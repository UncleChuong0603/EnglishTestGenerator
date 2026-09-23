import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ReviewQuestion } from "@/lib/practice/types";
import { AnswerReviewCard } from "./answer-review-card";

const wrong: ReviewQuestion = {
  id: "q1", number: 1, part: 5, text: "The manager ____ the report.", skill: "grammar", subSkill: "verb_tense",
  passageSetId: null, options: [{ id: "wrong", key: "A", text: "finish" }, { id: "right", key: "B", text: "finished" }],
  selectedOptionId: "wrong", correctOptionId: "right", isCorrect: false,
  explanationEn: "Past tense is required.", explanationVi: "Cần dùng thì quá khứ.",
};

describe("answer review disclosure", () => {
  it("shows the full explanation and correct option for a missed answer", () => {
    const html = renderToStaticMarkup(createElement(AnswerReviewCard, { question: wrong, locale: "vi", explanationLanguage: "both" }));
    expect(html).toContain("B. finished");
    expect(html).toContain("Past tense is required.");
    expect(html).toContain("Cần dùng thì quá khứ.");
    expect(html).not.toContain("<details");
  });

  it("keeps the explanation of a correct answer available on demand", () => {
    const html = renderToStaticMarkup(createElement(AnswerReviewCard, { question: { ...wrong, selectedOptionId: "right", isCorrect: true }, locale: "vi", explanationLanguage: "both" }));
    expect(html).toContain("<details");
    expect(html).toContain("Past tense is required.");
  });
});
