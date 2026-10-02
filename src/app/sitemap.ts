import type { MetadataRoute } from "next";
import { publishedSitemapRows } from "@/lib/blog/service";
import { getSiteUrl } from "@/lib/seo/site-url";
import { STATIC_PUBLIC_PATHS } from "@/lib/seo/routes";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPaths = STATIC_PUBLIC_PATHS;
  const listeningRevisionPaths = new Set(["/toeic/part-1", "/toeic/part-2", "/toeic/part-4"]);
  const staticPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    ...(listeningRevisionPaths.has(path) ? { lastModified: new Date("2026-10-02T00:00:00.000Z") } : {}),
  }));
  const posts = await publishedSitemapRows();

  return [
    ...staticPages,
    ...posts.map((post) => ({ url: `${base}${post.path}`, lastModified: post.updatedAt })),
  ];
}
