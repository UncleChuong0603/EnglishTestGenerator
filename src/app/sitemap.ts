import type { MetadataRoute } from "next";
import { publishedSitemapRows } from "@/lib/blog/service";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const base = process.env.APP_URL ?? "http://localhost:3000"; const staticPages=["", "/blog", "/pricing", "/privacy", "/terms", "/sign-in"].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === "" || path === "/blog" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : path === "/blog" ? 0.8 : path === "/pricing" ? 0.8 : 0.4 }));const posts=await publishedSitemapRows();return [...staticPages,...posts.map(post=>({url:`${base}/blog/${post.slug}`,lastModified:post.updatedAt,changeFrequency:"monthly" as const,priority:.7}))]; }
