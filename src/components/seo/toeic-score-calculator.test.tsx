import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ToeicScoreCalculator } from "./toeic-score-calculator";

describe("TOEIC score calculator", () => {
  it("server-renders useful defaults and accessible labels in both interface languages", () => {
    for (const locale of ["vi", "en"] as const) {
      const html = renderToStaticMarkup(<ToeicScoreCalculator locale={locale} />);
      expect(html).toContain('type="number"');
      expect(html.match(/<label/g)).toHaveLength(3);
      expect(html).toContain("650");
      expect(html).toContain("/ 990");
      expect(html).toContain(locale === "vi" ? "Tổng điểm" : "Total score");
      expect(html).toContain('aria-live="polite"');
    }
  });
});
