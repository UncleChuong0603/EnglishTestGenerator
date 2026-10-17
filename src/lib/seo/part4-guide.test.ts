import { describe, expect, it } from "vitest";
import { PART4_ERROR_ROUTES, PART4_FORMAT, PART4_REVIEW_PASSES, PART4_TALK_MAP, part4StructuredData } from "./part4-guide";

describe("Part 4 SEO guide", () => {
  it("maps the test format, talk types, errors and review loop", () => {
    expect(PART4_FORMAT).toEqual([
      ["30", "câu hỏi trong Part 4"],
      ["10", "bài nói, mỗi bài đi cùng 3 câu"],
      ["1", "người nói xuyên suốt mỗi bài"],
    ]);
    expect(PART4_TALK_MAP).toHaveLength(4);
    expect(PART4_ERROR_ROUTES).toHaveLength(4);
    expect(PART4_REVIEW_PASSES).toHaveLength(4);
  });

  it("describes the free audio and three-question quiz with absolute URLs", () => {
    const schema = part4StructuredData("https://example.com");

    expect(schema["@type"]).toBe("LearningResource");
    expect(schema.url).toBe("https://example.com/toeic/part-4");
    expect(schema.hasPart[0]).toMatchObject({
      "@type": "AudioObject",
      contentUrl: "https://example.com/seo/toeic-part-4-sample.mp3",
    });
    expect(schema.hasPart[1]).toMatchObject({ "@type": "Quiz", numberOfQuestions: 3 });
  });
});
