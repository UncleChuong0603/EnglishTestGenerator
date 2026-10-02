import type { MetadataRoute } from "next";
import { publishedSitemapRows } from "@/lib/blog/service";
import { getSiteUrl } from "@/lib/seo/site-url";
import { STATIC_PUBLIC_PATHS } from "@/lib/seo/routes";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPaths = STATIC_PUBLIC_PATHS;
  const staticPageRevisions = new Map<string, Date>([
    ["/toeic/part-1", new Date("2026-10-02T00:00:00.000Z")],
    ["/toeic/part-2", new Date("2026-10-02T00:00:00.000Z")],
    ["/toeic/part-4", new Date("2026-10-02T00:00:00.000Z")],
    ["/toeic/part-7/doc-hieu-mot-doan-van", new Date("2026-10-02T00:00:00.000Z")],
    ["/toeic/thang-diem", new Date("2026-10-02T00:00:00.000Z")],
  ]);
  const staticPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    ...(staticPageRevisions.has(path) ? { lastModified: staticPageRevisions.get(path) } : {}),
  }));
  const posts = await publishedSitemapRows();

  return [
    ...staticPages,
    ...posts.map((post) => ({ url: `${base}${post.path}`, lastModified: post.updatedAt })),
  ];
}
