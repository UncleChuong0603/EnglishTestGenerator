import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResultReview } from "./result-review";

const items = [
  { id: "q1", number: 1, isCorrect: false },
  { id: "q2", number: 2, isCorrect: true },
];

describe("result review controls", () => {
  it("starts on missed answers while retaining every server-rendered review", () => {
    const html = renderToStaticMarkup(
      <ResultReview defaultFilter="incorrect" items={items} locale="vi">
        <article data-result-status="incorrect">Lời giải câu sai</article>
        <article data-result-status="correct">Lời giải câu đúng</article>
      </ResultReview>,
    );

    expect(html).toContain('data-review-filter="incorrect"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Lời giải câu sai");
    expect(html).toContain("Lời giải câu đúng");
    expect(html).toContain('href="#review-question-1"');
    expect(html).not.toContain('href="#review-question-2"');
  });
});
