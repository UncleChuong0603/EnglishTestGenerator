import { describe, expect, it } from "vitest";
import { EDITORIAL_POSTS } from "./editorial";
import { GRAMMAR_LEARNING_PATH, GRAMMAR_LESSONS, GRAMMAR_TOEIC_COVERAGE, relatedGrammarLessons } from "./grammar-learning-path";

describe("grammar learning path", () => {
  it("links each grammar lesson exactly once to an indexable article", () => {
    const slugs = GRAMMAR_LESSONS.map(lesson => lesson.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(GRAMMAR_LEARNING_PATH.length).toBe(5);
    expect(GRAMMAR_LESSONS).toHaveLength(41);
    for (const lesson of GRAMMAR_LESSONS) {
      const post = EDITORIAL_POSTS.find(item => item.slug === lesson.slug);
      expect(post, lesson.slug).toBeDefined();
      expect(post?.category).toBe("GRAMMAR");
      expect(post?.noindex).toBe(false);
      expect(post?.canonicalPath).toBe(`/blog/${lesson.slug}`);
      expect(relatedGrammarLessons(lesson.slug).every(item => item.slug !== lesson.slug)).toBe(true);
    }
  });

  it("covers every published bundled grammar post", () => {
    const slugs = new Set(GRAMMAR_LESSONS.map(lesson => lesson.slug));
    for (const post of EDITORIAL_POSTS.filter(item => item.category === "GRAMMAR")) {
      expect(slugs.has(post.slug), post.slug).toBe(true);
    }
  });

  it("maps grammar support across every TOEIC Listening and Reading part", () => {
    expect(GRAMMAR_TOEIC_COVERAGE.map(item => item.parts)).toEqual(["1–2", "3–4", "5", "6–7"]);
    expect(GRAMMAR_TOEIC_COVERAGE.every(item => item.href.startsWith("/blog/") && item.vi.summary && item.en.summary)).toBe(true);
  });
});
