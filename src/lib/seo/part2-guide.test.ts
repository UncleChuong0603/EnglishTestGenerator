import { describe, expect, it } from "vitest";
import { PART2_ERROR_ROUTES, PART2_FORMAT, PART2_INTENT_MAP, PART2_REVIEW_PASSES, part2StructuredData } from "./part2-guide";

describe("Part 2 SEO guide", () => {
  it("maps the format, conversational intents, errors and review loop", () => {
    expect(PART2_FORMAT).toEqual([
      ["25", "câu hỏi trong Part 2"],
      ["1", "câu hỏi hoặc câu nói ở mỗi lượt"],
      ["3", "phản hồi bằng tiếng Anh để lựa chọn"],
    ]);
    expect(PART2_INTENT_MAP).toHaveLength(4);
    expect(PART2_ERROR_ROUTES).toHaveLength(4);
    expect(PART2_REVIEW_PASSES).toHaveLength(4);
  });

  it("describes all four free audio samples and their quiz with absolute URLs", () => {
    const schema = part2StructuredData("https://example.com");
    const audio = schema.hasPart.filter((part) => part["@type"] === "AudioObject");

    expect(schema["@type"]).toBe("LearningResource");
    expect(schema.url).toBe("https://example.com/toeic/part-2");
    expect(audio).toHaveLength(4);
    expect(audio[0]).toMatchObject({
      "@type": "AudioObject",
      contentUrl: "https://example.com/seo/toeic-part-2-sample.mp3",
    });
    expect(schema.hasPart.at(-1)).toMatchObject({ "@type": "Quiz", numberOfQuestions: 4 });
  });
});
