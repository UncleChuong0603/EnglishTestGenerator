import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArticleView } from "@/components/blog/article-view";
import { getPublishedPost, listPublishedPosts, coverUrl } from "@/lib/blog/service";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getSiteUrl } from "@/lib/seo/site-url";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Không tìm thấy bài viết", robots: { index: false, follow: false } };
  const image = await coverUrl(post.coverMediaId) || `/blog/cover/${post.category.toLowerCase()}`;
  const canonical = post.canonicalPath || `/blog/${post.slug}`;
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return { title, description, robots:post.noindex?{index:false,follow:true}:undefined, alternates:{canonical}, openGraph: { title:post.socialTitle||title, description:post.socialDescription||description, type: "article", publishedTime: post.publishedAt?.toISOString(), modifiedTime: post.updatedAt.toISOString(), url: canonical, images: image ? [image] : [] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const user = await getCurrentUser();
  const [prefs, storedImage, posts] = await Promise.all([getPreferences(user?.id), coverUrl(post.coverMediaId), listPublishedPosts()]);
  const image = storedImage || `/blog/cover/${post.category.toLowerCase()}`;
  const related = posts.filter(item => item.slug !== post.slug && item.category === post.category).slice(0, 2);
  const base = getSiteUrl();
  const url = new URL(post.canonicalPath || `/blog/${post.slug}`, base).toString();
  const jsonLd = { "@context":"https://schema.org", "@type":"BlogPosting", headline: post.title, description: post.seoDescription || post.excerpt, datePublished: post.publishedAt?.toISOString(), dateModified: post.updatedAt.toISOString(), url, image: image ? new URL(image, base).toString() : undefined, author: post.authorName?{ "@type": "Person", name:post.authorName }:{ "@type": "Organization", name: "TOEICGym" }, publisher: { "@type": "Organization", name: "TOEICGym" } };
  return <main className="min-h-screen bg-white text-slate-900"><PublicHeader locale={prefs.interfaceLanguage} signedIn={Boolean(user)} /><script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} type="application/ld+json" /><ArticleView coverUrl={image} locale={prefs.interfaceLanguage} post={post} related={related} signedIn={Boolean(user)} /><PublicFooter locale={prefs.interfaceLanguage} /></main>;
}
