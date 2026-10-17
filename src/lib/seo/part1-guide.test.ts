import { describe, expect, it } from "vitest";
import { PART1_ERROR_ROUTES, PART1_FORMAT, PART1_REVIEW_PASSES, PART1_SCAN_LAYERS, part1StructuredData } from "./part1-guide";

describe("Part 1 SEO guide", () => {
  it("maps the format, image scan, common errors and review loop", () => {
    expect(PART1_FORMAT).toEqual([
      ["6", "câu hỏi trong Part 1"],
      ["1", "bức ảnh dùng cho mỗi câu"],
      ["4", "câu mô tả bằng tiếng Anh để lựa chọn"],
    ]);
    expect(PART1_SCAN_LAYERS).toHaveLength(4);
    expect(PART1_ERROR_ROUTES).toHaveLength(4);
    expect(PART1_REVIEW_PASSES).toHaveLength(4);
  });

  it("describes the free image, audio and quiz with absolute URLs", () => {
    const schema = part1StructuredData("https://example.com");

    expect(schema["@type"]).toBe("LearningResource");
    expect(schema.url).toBe("https://example.com/toeic/part-1");
    expect(schema.hasPart[0]).toMatchObject({
      "@type": "ImageObject",
      contentUrl: "https://example.com/seo/toeic-part-1-office-folders.webp",
    });
    expect(schema.hasPart[1]).toMatchObject({
      "@type": "AudioObject",
      contentUrl: "https://example.com/seo/toeic-part-1-sample.mp3",
    });
    expect(schema.hasPart[2]).toMatchObject({ "@type": "Quiz", numberOfQuestions: 1 });
  });
});
