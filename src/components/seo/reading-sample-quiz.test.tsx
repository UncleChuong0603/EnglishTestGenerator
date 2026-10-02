import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReadingSampleQuiz } from "./reading-sample-quiz";
import { readingParaphraseGuide } from "@/lib/seo/reading-paraphrase-guide";

describe("ReadingSampleQuiz", () => {
  it("keeps every answer and explanation accessible before client interaction", () => {
    const html = renderToStaticMarkup(<ReadingSampleQuiz id="paraphrase" questions={readingParaphraseGuide.questions} />);
    expect(html.match(/<fieldset/g)).toHaveLength(6);
    expect(html.match(/<details/g)).toHaveLength(6);
    expect(html).toContain("Đáp án và bằng chứng câu 6");
    expect(html).toContain("Chấm tự động cần JavaScript");
    for (const question of readingParaphraseGuide.questions) {
      expect(html).toContain(question.explanation);
    }
  });

  it("localizes controls for the English interface", () => {
    const html = renderToStaticMarkup(<ReadingSampleQuiz id="paraphrase-en" locale="en" questions={readingParaphraseGuide.questions} />);
    expect(html).toContain("Check answers");
    expect(html).toContain("Answer and evidence for question 6");
    expect(html).toContain("Automatic scoring requires JavaScript");
  });
});
