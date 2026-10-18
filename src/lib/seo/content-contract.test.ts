import { describe, expect, it } from "vitest";
import { EDITORIAL_POSTS } from "@/lib/blog/editorial";
import { MANAGED_SEO_DOCUMENTS } from "./managed-content";
import { STATIC_PUBLIC_PATHS } from "./routes";

describe("site-wide indexable content contract", () => {
  it("keeps every bundled article within useful search metadata ranges", () => {
    for (const post of [...EDITORIAL_POSTS, ...MANAGED_SEO_DOCUMENTS]) {
      const title = (post.seoTitle || post.title).trim();
      const description = (post.seoDescription || post.excerpt).trim();
      expect(title.length, `${post.slug} title`).toBeGreaterThanOrEqual(30);
      expect(title.length, `${post.slug} title`).toBeLessThanOrEqual(65);
      expect(description.length, `${post.slug} description`).toBeGreaterThanOrEqual(110);
      expect(description.length, `${post.slug} description`).toBeLessThanOrEqual(165);
      expect(post.targetTopic?.trim(), `${post.slug} target topic`).toBeTruthy();
      expect(post.searchIntent?.trim(), `${post.slug} search intent`).toBeTruthy();
      expect(post.canonicalPath, `${post.slug} canonical`).toMatch(/^\/(?!\/)/);
      expect(post.content, `${post.slug} internal link`).toMatch(/\]\(\//);
    }
  });

  it("keeps the account-deletion utility accessible but out of the XML sitemap", () => {
    expect(STATIC_PUBLIC_PATHS).not.toContain("/delete-account");
  });
});
