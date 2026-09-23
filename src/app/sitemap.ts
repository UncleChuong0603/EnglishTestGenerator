import type { MetadataRoute } from "next";
import { publishedSitemapRows } from "@/lib/blog/service";
import { getSiteUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPages: MetadataRoute.Sitemap = ["", "/toeic", "/luyen-thi-toeic-online", "/toeic/part-5", "/toeic/part-5/word-form", "/toeic/part-6", "/toeic/part-7", "/blog", "/pricing", "/try", "/diagnostic", "/support", "/privacy", "/terms"].map((path) => ({
    url: `${base}${path}`,
  }));
  const posts = await publishedSitemapRows();

  return [
    ...staticPages,
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.updatedAt })),
  ];
}
