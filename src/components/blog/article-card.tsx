import Link from "next/link";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/blog/core";
import { readingMinutes } from "@/lib/blog/service";
import type { InterfaceLanguage } from "@/lib/i18n/config";

type CardPost = { slug: string; title: string; excerpt: string; category: string; content: string; publishedAt: Date | null };

export function ArticleCard({ post, image, locale, featured = false }: { post: CardPost; image: string | null; locale: InterfaceLanguage; featured?: boolean }) {
  const category = CATEGORY_LABELS[post.category as PostCategory]?.[locale] ?? post.category;
  return <article className={`group overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-sm ${featured ? "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]" : "flex flex-col"}`}>
    {image ? <img alt="" className={featured ? "aspect-[16/10] h-full max-h-96 w-full object-cover" : "aspect-[16/9] w-full object-cover"} src={image} /> : featured ? <div aria-hidden="true" className="hidden min-h-72 bg-gradient-to-br from-teal-50 via-white to-slate-100 md:block" /> : null}
    <div className={`flex flex-1 flex-col ${featured ? "p-5 sm:p-10" : "p-5 sm:p-6"}`}>
      <p className="text-sm font-black text-teal-800">{category}</p>
      <h2 className={`mt-3 break-words font-black leading-tight tracking-tight text-slate-950 ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}><Link className="rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-700" href={`/blog/${post.slug}`}>{post.title}</Link></h2>
      <p className="mt-3 line-clamp-3 leading-6 text-slate-600 sm:mt-4 sm:leading-7">{post.excerpt}</p>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-8"><p className="text-sm text-slate-500">{post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{post.publishedAt.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}</time>} · {readingMinutes(post.content)} {locale === "vi" ? "phút đọc" : "min read"}</p><Link className="font-bold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={`/blog/${post.slug}`}>{locale === "vi" ? "Đọc bài viết" : "Read article"} <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span></Link></div>
    </div>
  </article>;
}
