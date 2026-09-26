import { describe, expect, it } from "vitest";
import { EDITORIAL_POSTS } from "./editorial";
import { GRAMMAR_LEARNING_PATH, GRAMMAR_LESSONS, relatedGrammarLessons } from "./grammar-learning-path";

describe("grammar learning path", () => {
  it("links each grammar lesson exactly once to an indexable article", () => {
    const slugs = GRAMMAR_LESSONS.map(lesson => lesson.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(GRAMMAR_LEARNING_PATH.length).toBe(4);
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
});
