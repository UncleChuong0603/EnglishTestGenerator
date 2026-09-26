import { existsSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EDITORIAL_POSTS } from "@/lib/blog/editorial";
import { checkPublication } from "@/lib/blog/publication-quality";
import { Markdown } from "@/components/blog/markdown";
import { MiniPractice } from "@/components/seo/mini-practice";
import { MANAGED_SEO_DOCUMENTS } from "./managed-content";
import { contentPath, MANAGED_SEO_ROUTES } from "./routes";
import { MINI_PRACTICE, practiceForSlug } from "./mini-practice";

const library = [...EDITORIAL_POSTS, ...MANAGED_SEO_DOCUMENTS];
describe("autonomous SEO release", () => {
  for (const post of library) {
    it(`checks publication, public rendering and links: ${contentPath(post.slug)}`, () => {
      const peers = library.filter(peer => peer.slug !== post.slug);
      const quality = checkPublication({ ...post, coverMediaId: undefined, tags: post.tags.map(tag => tag.name) }, peers);
      expect(quality.errors).toEqual([]);
      const html = renderToStaticMarkup(<article lang="vi"><h1>{post.title}</h1><Markdown content={post.content} /></article>);
      expect(html.match(/<h1[ >]/g)).toHaveLength(1);
      expect(html).toContain('lang="vi"');
      expect(html).not.toContain("�");
      for (const [, image] of post.content.matchAll(/!\[[^\]]*\]\((\/[^)]+)\)/g)) expect(existsSync(`public${image}`), image).toBe(true);
    });
  }
  it("owns each slug and canonical exactly once", () => {
    expect(new Set(library.map(post => post.slug)).size).toBe(library.length);
    expect(new Set(library.map(post => post.canonicalPath)).size).toBe(library.length);
    for (const [slug, path] of Object.entries(MANAGED_SEO_ROUTES)) {
      expect(MANAGED_SEO_DOCUMENTS.some(post => post.slug === slug && post.canonicalPath === path)).toBe(true);
      expect(existsSync(`src/app${path}/page.tsx`)).toBe(true);
    }
  });
  it("renders original exercises and records a reason for every option", () => {
    const questions = Object.values(MINI_PRACTICE).flat();
    expect(new Set(questions.map(q => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(q.origin).toBe("TOEICGYM_ORIGINAL");
      expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.distractors.every(reason => reason.trim())).toBe(true);
      expect(q.explanation.toLowerCase()).toContain(q.options[q.answer].toLowerCase());
    }
    const html = renderToStaticMarkup(<MiniPractice questions={practiceForSlug("seo-part5-practice")} />);
    expect(html.match(/<fieldset/g)).toHaveLength(7);
    expect(html.toLowerCase()).toContain("không cần đăng nhập");
  });
});
