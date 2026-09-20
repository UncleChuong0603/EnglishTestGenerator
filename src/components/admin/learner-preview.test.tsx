import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LearnerPreview } from "./learner-preview";
import type { ComponentProps } from "react";

const question = {
  id: "question-1", number: 1, part: 7 as const, text: "What is the notice about?", skill: "detail", subSkill: "explicit_information", passageSetId: "group-1",
  options: [{ id: "option-a", key: "A", text: "A meeting" }, { id: "option-b", key: "B", text: "A shipment" }],
  correctOptionId: "option-b", explanationEn: "The second document states this.", explanationVi: "Tài liệu thứ hai cho biết điều này.",
};
const data: ComponentProps<typeof LearnerPreview>["data"] = {
  part: 7, title: "Shipping notice", lifecycle: "draft", issues: ["Review required"], media: [],
  passages: [
    { id: "doc-1", title: "First notice", content: "First document content", position: 1, documentType: "notice" },
    { id: "doc-2", title: "Second notice", content: "Second document content", position: 2, documentType: "notice" },
  ],
  questions: [question],
};

describe("admin learner preview before submission", () => {
  it("keeps answer and explanations out of the rendered pre-submit view", () => {
    const html = renderToStaticMarkup(<LearnerPreview data={data} initialLocale="en" />);
    expect(html).toContain("What is the notice about?");
    expect(html).toContain("Review required");
    expect(html).not.toContain("The second document states this.");
    expect(html).not.toContain("Tài liệu thứ hai cho biết điều này.");
    expect(html).not.toContain("Correct answer");
  });
  it("renders every document in the grouped learner presentation", () => {
    const html = renderToStaticMarkup(<LearnerPreview data={data} initialLocale="vi" />);
    expect(html).toContain("First document content");
    expect(html).toContain("Second document content");
    expect(html).toContain("Bản nháp");
  });
});
