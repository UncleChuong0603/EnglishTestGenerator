import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArticleView } from "@/components/blog/article-view";
import { getPublishedPost, getPostRedirect, listPublishedPosts, coverUrl } from "@/lib/blog/service";
import { isManagedSeoSlug } from "@/lib/seo/routes";
import { grammarImageForSlug } from "@/lib/blog/editorial";
import { relatedGrammarLessons } from "@/lib/blog/grammar-learning-path";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getSiteUrl } from "@/lib/seo/site-url";
import { articleStructuredData } from "@/lib/seo/article-structured-data";
import { serializeStructuredData } from "@/lib/seo/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (isManagedSeoSlug(slug)) notFound();
  const destination = await getPostRedirect(slug);
  if (destination) permanentRedirect(destination);
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Không tìm thấy bài viết", robots: { index: false, follow: false } };
  const image = await coverUrl(post.coverMediaId) || grammarImageForSlug(post.slug) || ("editorialCover" in post && typeof post.editorialCover === "string" ? post.editorialCover : null) || `/blog/cover/${post.category.toLowerCase()}`;
  const canonical = post.canonicalPath || `/blog/${post.slug}`;
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const titleIncludesBrand = /[|–—-]\s*TOEIC\s*GYM\s*$/i.test(title);
  const socialTitle = post.socialTitle || `${title}${titleIncludesBrand ? "" : " | TOEIC GYM"}`;
  const socialDescription = post.socialDescription || description;
  return {
    title: titleIncludesBrand ? { absolute: title } : title,
    description,
    robots: post.noindex ? { index: false, follow: true } : undefined,
    alternates:{canonical},
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      type: "article",
      locale: "vi_VN",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      url: canonical,
      images: image ? [image] : [],
    },
    twitter: { card: "summary_large_image", title: socialTitle, description: socialDescription, images: image ? [image] : [] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (isManagedSeoSlug(slug)) notFound();
  const destination = await getPostRedirect(slug);
  if (destination) permanentRedirect(destination);
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const user = await getCurrentUser();
  const [prefs, storedImage, posts] = await Promise.all([getPreferences(user?.id), coverUrl(post.coverMediaId), listPublishedPosts(200)]);
  const image = storedImage || grammarImageForSlug(post.slug) || ("editorialCover" in post && typeof post.editorialCover === "string" ? post.editorialCover : null) || `/blog/cover/${post.category.toLowerCase()}`;
  const publishedBySlug = new Map(posts.map(item => [item.slug, item]));
  const grammarRelated = post.category === "GRAMMAR" ? relatedGrammarLessons(post.slug).map(lesson => publishedBySlug.get(lesson.slug)).filter((item): item is (typeof posts)[number] => Boolean(item)) : [];
  const related = grammarRelated.length ? grammarRelated.slice(0, 2) : posts.filter(item => item.slug !== post.slug && item.category === post.category).slice(0, 2);
  const base = getSiteUrl();
  const url = new URL(post.canonicalPath || `/blog/${post.slug}`, base).toString();
  const jsonLd = articleStructuredData({
    base,
    url,
    title: post.title,
    description: post.seoDescription || post.excerpt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    image: image ? new URL(image, base).toString() : null,
    authorName: post.authorName,
    breadcrumbs: [
      ...(post.category === "GRAMMAR"
        ? [{ name: "Ngữ pháp TOEIC A–Z", url: new URL("/ngu-phap", base).toString() }]
        : [{ name: "Kiến thức TOEIC", url: new URL("/blog", base).toString() }]),
      { name: post.title, url },
    ],
  });
  return <main className="min-h-screen bg-white text-slate-900"><PublicHeader locale={prefs.interfaceLanguage} signedIn={Boolean(user)} /><script dangerouslySetInnerHTML={{ __html: serializeStructuredData(jsonLd) }} type="application/ld+json" /><ArticleView coverUrl={image} locale={prefs.interfaceLanguage} post={post} related={related} signedIn={Boolean(user)} /><PublicFooter locale={prefs.interfaceLanguage} /></main>;
}
