import { describe, expect, it } from "vitest";
import { checkPublication, validRedirectDestination } from "./publication-quality";
import type { PostInput } from "./core";

const article: PostInput = {
  title: "Cách sửa lỗi giới từ trong Part 5", slug: "sua-loi-gioi-tu-part-5", category: "GRAMMAR",
  excerpt: "Xem một ví dụ công sở và thử cách sửa lỗi giới từ.",
  content: "## Tìm cụm từ\nThe manager is responsible for the report.\n\n[Thử thách Part 5](/challenge/part-5)",
  targetTopic: "sửa lỗi giới từ Part 5", searchIntent: "Hướng dẫn", tags: [],
};

describe("publication quality gate", () => {
  it("accepts a useful article with a valid internal next step", () => {
    expect(checkPublication(article, []).errors).toEqual([]);
  });
  it("blocks duplicate intent and canonical collisions", () => {
    const peer = { slug: "gioi-tu", title: "Giới từ TOEIC", canonicalPath: "/blog/sua-loi-gioi-tu-part-5", targetTopic: article.targetTopic, searchIntent: article.searchIntent };
    expect(checkPublication(article, [peer]).errors).toEqual(expect.arrayContaining(["CANONICAL_COLLISION", "SEARCH_INTENT_DUPLICATE"]));
  });
  it("blocks broken and unsafe internal references", () => {
    expect(checkPublication({ ...article, content: "## Xem thêm\n[Bài thiếu](/blog/khong-co-bai) [Sai](javascript:alert(1))" }, []).errors)
      .toEqual(expect.arrayContaining(["BROKEN_INTERNAL_LINK:/blog/khong-co-bai", "UNSAFE_LINK"]));
  });
  it("blocks an extra H1 and unsupported result claims", () => {
    expect(checkPublication({ ...article, content: "# H1 khác\n## Hướng dẫn\nĐảm bảo tăng 200 điểm TOEIC." }, []).errors)
      .toEqual(expect.arrayContaining(["SECOND_H1", "UNSUPPORTED_SCORE_CLAIM"]));
  });
  it("requires a safe local image with alt text", () => {
    expect(checkPublication({ ...article, content: "## Ví dụ\n![](/missing.png)" }, []).errors)
      .toContain("IMAGE_REFERENCE_INVALID");
  });
  it("does not redirect archived content to a noindex article", () => {
    expect(validRedirectDestination("/blog/noindex-guide", "old-guide", [{ slug: "noindex-guide", title: "Guide", noindex: true }])).toBe(false);
    expect(validRedirectDestination("/toeic/part-5", "old-guide", [{ slug: "seo-part5", title: "Part 5", noindex: false }])).toBe(true);
  });
});
