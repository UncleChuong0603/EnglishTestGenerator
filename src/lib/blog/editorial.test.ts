import { describe, expect, it } from "vitest";
import { POST_CATEGORIES } from "./core";
import { EDITORIAL_POSTS, getEditorialPost } from "./editorial";

describe("editorial TOEIC library", () => {
  it("ships at least one SEO-ready article for every public category", () => {
    for (const category of POST_CATEGORIES) {
      const posts = EDITORIAL_POSTS.filter(post => post.category === category);
      expect(posts.length).toBeGreaterThanOrEqual(1);
      for (const post of posts) {
        expect(post.seoTitle.length).toBeGreaterThan(20);
        expect(post.seoDescription.length).toBeGreaterThan(70);
        expect(post.coverAlt.length).toBeGreaterThan(15);
        expect(post.content.split(/\s+/).length).toBeGreaterThan(200);
      }
    }
  });

  it("resolves bundled articles by slug", () => {
    const first = EDITORIAL_POSTS[0];
    expect(getEditorialPost(first.slug)?.id).toBe(first.id);
    expect(getEditorialPost("not-a-real-post")).toBeNull();
  });

  it("keeps canonical paths aligned with public slugs", () => {
    for (const post of EDITORIAL_POSTS) {
      expect(post.canonicalPath).toBe(`/blog/${post.slug}`);
    }
  });
});
