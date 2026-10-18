import { describe, expect, it } from "vitest";
import { selectRelatedPosts, type RelatedPostCandidate } from "./related-posts";

const date = new Date("2026-10-18T00:00:00.000Z");
const post = (slug: string, title: string, category = "GRAMMAR", noindex = false): RelatedPostCandidate => ({
  slug, title, category, noindex, publishedAt: date,
});

describe("related article selection", () => {
  it("prioritizes explicit learning-path neighbors and excludes noindex pages", () => {
    const current = post("said-told", "Said và told khác nhau thế nào?");
    const candidates = [
      post("generic", "Ngữ pháp tiếng Anh tổng hợp"),
      post("reported", "Câu tường thuật với asked và told"),
      post("hidden", "Said và told nâng cao", "GRAMMAR", true),
    ];
    expect(selectRelatedPosts(current, candidates, ["reported"], 3).map(item => item.slug)).toEqual(["reported", "generic"]);
  });

  it("uses topic overlap before unrelated recent content", () => {
    const current = post("part-3", "TOEIC Part 3 hội thoại ba người", "LISTENING");
    const candidates = [
      post("part-5", "TOEIC Part 5 loại từ", "GRAMMAR"),
      post("part-3-trap", "Bẫy nghe TOEIC Part 3", "LISTENING"),
    ];
    expect(selectRelatedPosts(current, candidates, [], 1)[0].slug).toBe("part-3-trap");
  });
});

