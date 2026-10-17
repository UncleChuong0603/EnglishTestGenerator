import { describe, expect, it } from "vitest";
import { PART3_ERROR_ROUTES, PART3_FORMAT, PART3_REVIEW_PASSES, part3StructuredData } from "./part3-guide";

describe("Part 3 SEO guide", () => {
  it("maps the format, common errors and a complete review loop", () => {
    expect(PART3_FORMAT).toEqual([
      ["39", "câu hỏi trong Part 3"],
      ["13", "hội thoại, mỗi hội thoại 3 câu"],
      ["2–3", "người nói có thể xuất hiện trong hội thoại"],
    ]);
    expect(PART3_ERROR_ROUTES).toHaveLength(4);
    expect(PART3_REVIEW_PASSES).toHaveLength(4);
  });

  it("describes the free audio and three-question quiz with absolute URLs", () => {
    const schema = part3StructuredData("https://example.com");

    expect(schema["@type"]).toBe("LearningResource");
    expect(schema.url).toBe("https://example.com/toeic/part-3");
    expect(schema.hasPart[0]).toMatchObject({
      "@type": "AudioObject",
      contentUrl: "https://example.com/seo/toeic-part-3-sample.mp3",
    });
    expect(schema.hasPart[1]).toMatchObject({ "@type": "Quiz", numberOfQuestions: 3 });
  });
});
