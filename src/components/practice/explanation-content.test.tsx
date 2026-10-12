import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExplanationContent } from "./explanation-content";

describe("ExplanationContent", () => {
  it.each([
    ["en", true, false],
    ["vi", false, true],
    ["both", true, true],
  ] as const)("honors the %s explanation preference", (explanationLanguage, english, vietnamese) => {
    const html = renderToStaticMarkup(
      <ExplanationContent
        explanationEn="English evidence."
        explanationLanguage={explanationLanguage}
        explanationVi="Bằng chứng tiếng Việt."
        locale="vi"
      />,
    );
    expect(html.includes("English evidence.")).toBe(english);
    expect(html.includes("Bằng chứng tiếng Việt.")).toBe(vietnamese);
  });

  it("uses the localized missing-language message without leaking the other language", () => {
    const html = renderToStaticMarkup(
      <ExplanationContent
        explanationEn={null}
        explanationLanguage="en"
        explanationVi="Không dùng nội dung này."
        locale="en"
      />,
    );
    expect(html).toContain("No English explanation is available yet.");
    expect(html).not.toContain("Không dùng nội dung này");
  });
});
