import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NextLearningStep } from "./next-learning-step";

describe("NextLearningStep", () => {
  it("explains the evidence-backed next step in Vietnamese", () => {
    const html = renderToStaticMarkup(
      <NextLearningStep hasRecommendation locale="vi" wrongCount={2} />,
    );
    expect(html).toContain("2 câu chưa đúng");
    expect(html).toContain("tính lại từ dữ liệu thật");
    expect(html).not.toContain("href=");
  });

  it("offers a real dashboard fallback when no recommendation is available", () => {
    const html = renderToStaticMarkup(
      <NextLearningStep hasRecommendation={false} locale="en" wrongCount={0} />,
    );
    expect(html).toContain("saved to your learning history");
    expect(html).toContain('href="/dashboard#today-workout"');
  });
});
