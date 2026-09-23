import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { POST_CATEGORIES } from "./core";
import { EDITORIAL_POSTS, getEditorialPost, grammarImageForSlug } from "./editorial";

describe("editorial TOEIC library", () => {
  it("ships at least one SEO-ready article for every public category", () => {
    for (const category of POST_CATEGORIES.filter(category => category !== "EXAM_REVIEW")) {
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

  it("includes an ETS sample review with its own illustration", () => {
    expect(POST_CATEGORIES).toContain("EXAM_REVIEW");
    const review = EDITORIAL_POSTS.find(post => post.category === "EXAM_REVIEW");
    expect(review).toBeDefined();
    expect(review?.content).toContain("toeic-listening-reading-sample-test.pdf");
    expect(review?.editorialCover).toBe("/blog/ets-2025-reading-sample-review.webp");
    expect(existsSync("public/blog/ets-2025-reading-sample-review.webp")).toBe(true);
  });

  it("resolves bundled articles by slug", () => {
    const first = EDITORIAL_POSTS[0];
    expect(getEditorialPost(first.slug)?.id).toBe(first.id);
    expect(getEditorialPost("not-a-real-post")).toBeNull();
  });

  it("covers every TOEIC part with a distinct, linked guide", () => {
    const slugs = EDITORIAL_POSTS.map(post => post.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const part of [1, 2, 5, 6, 7]) {
      expect(EDITORIAL_POSTS.some(post => post.slug.startsWith(`meo-lam-toeic-part-${part}-`))).toBe(true);
    }
    expect(EDITORIAL_POSTS.some(post => post.slug === "cach-luyen-nghe-toeic-part-3-4")).toBe(true);
  });

  it("keeps canonical paths aligned with public slugs", () => {
    for (const post of EDITORIAL_POSTS) {
      expect(post.canonicalPath).toBe(`/blog/${post.slug}`);
    }
  });

  it("keeps editorial learning links and illustrations resolvable", () => {
    const slugs = new Set(EDITORIAL_POSTS.map(post => post.slug));
    for (const post of EDITORIAL_POSTS) {
      for (const [, slug] of post.content.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) {
        expect(slugs.has(slug), `${post.slug} links to missing article ${slug}`).toBe(true);
      }
    }
    expect(existsSync("public/blog/reading-75-minute-plan.svg")).toBe(true);
    for (const post of EDITORIAL_POSTS) {
      const image = grammarImageForSlug(post.slug);
      if (image) expect(existsSync(`public${image}`), `missing image for ${post.slug}`).toBe(true);
      if (post.editorialCover.startsWith("/blog/") && !post.editorialCover.startsWith("/blog/cover/")) {
        expect(existsSync(`public${post.editorialCover}`), `missing cover for ${post.slug}`).toBe(true);
      }
    }
  });
});
