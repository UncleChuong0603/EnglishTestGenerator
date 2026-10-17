import { describe, expect, it, vi } from "vitest";

const { editorialUpdatedAt } = vi.hoisted(() => ({ editorialUpdatedAt: new Date("2026-09-01T00:00:00.000Z") }));
vi.mock("@/lib/blog/service", () => ({
  publishedSitemapRows: vi.fn().mockResolvedValue([
    { slug: "seo-online", path: "/luyen-thi-toeic-online", updatedAt: editorialUpdatedAt },
    { slug: "guide", path: "/blog/guide", updatedAt: editorialUpdatedAt },
  ]),
}));
vi.mock("@/lib/seo/site-url", () => ({ getSiteUrl: () => "https://example.com" }));
vi.mock("@/lib/seo/routes", () => ({ STATIC_PUBLIC_PATHS: ["/"] }));

import sitemap from "./sitemap";

describe("sitemap revisions", () => {
  it("uses a code revision date for a managed route without changing normal editorial dates", async () => {
    const rows = await sitemap();
    const online = rows.find((row) => row.url.endsWith("/luyen-thi-toeic-online"));
    const guide = rows.find((row) => row.url.endsWith("/blog/guide"));

    expect(online?.lastModified).toEqual(new Date("2026-10-16T00:00:00.000Z"));
    expect(guide?.lastModified).toEqual(editorialUpdatedAt);
  });
});
