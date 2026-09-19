import Link from "next/link";
import { Markdown } from "./markdown";
import { ArticleCard } from "./article-card";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/blog/core";
import { readingMinutes } from "@/lib/blog/service";

type Article = { slug?: string; title: string; excerpt: string; content: string; category: string; publishedAt: Date | null; updatedAt: Date; tags: { name: string; slug: string }[] };
type Related = { id: string; slug: string; title: string; excerpt: string; category: string; content: string; publishedAt: Date | null };

export function ArticleView({ post, locale, coverUrl, preview = false, signedIn = false, related = [] }: { post: Article; locale: "vi" | "en"; coverUrl: string | null; preview?: boolean; signedIn?: boolean; related?: Related[] }) {
  const category = CATEGORY_LABELS[post.category as PostCategory]?.[locale] ?? post.category;
  return <>
    <article className="mx-auto max-w-3xl px-5 pb-12 pt-9 sm:px-6 sm:pb-16 sm:pt-12">
      {preview && <p className="mb-6 rounded-xl bg-amber-100 p-4 text-center font-black text-amber-900">Bản xem trước — không công khai, không lập chỉ mục</p>}
      <header>
        <nav aria-label={locale === "vi" ? "Đường dẫn" : "Breadcrumb"} className="text-sm"><Link className="font-semibold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-teal-700" href="/blog">← {locale === "vi" ? "Kiến thức TOEIC" : "TOEIC Guides"}</Link><span className="mx-2 text-slate-400">/</span><span className="text-slate-600">{category}</span></nav>
        <p className="mt-8 text-sm font-black uppercase tracking-wider text-teal-800">{category}</p>
        <h1 className="mt-3 break-words text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 sm:text-xl">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-500">{post.publishedAt ? <time dateTime={post.publishedAt.toISOString()}>{post.publishedAt.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}</time> : <span>{locale === "vi" ? "Bản nháp" : "Draft"}</span>}<span aria-hidden="true">·</span><span>{readingMinutes(post.content)} {locale === "vi" ? "phút đọc" : "min read"}</span></div>
      </header>
      {coverUrl && <img alt="" className="mt-8 max-h-[32rem] w-full rounded-2xl object-cover" src={coverUrl} />}
      <div className="mt-9"><Markdown content={post.content} /></div>
      {post.tags.length > 0 && <div aria-label={locale === "vi" ? "Thẻ bài viết" : "Article tags"} className="mt-9 flex flex-wrap gap-2">{post.tags.map(tag => <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700" key={tag.slug}>#{tag.name}</span>)}</div>}
      <aside className="mt-12 rounded-3xl bg-slate-900 p-7 text-white sm:p-9"><h2 className="text-2xl font-black">{locale === "vi" ? "Luyện ngay nội dung vừa học" : "Put what you learned into practice"}</h2><p className="mt-3 max-w-xl leading-7 text-slate-200">{locale === "vi" ? "Thử một bài luyện ngắn và áp dụng kiến thức vào câu hỏi TOEIC." : "Try a short practice and apply what you learned to TOEIC questions."}</p><Link className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-teal-300 px-5 font-black text-slate-950 hover:bg-teal-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300" href={signedIn ? "/practice" : "/try"}>{locale === "vi" ? "Bắt đầu luyện tập" : "Start practicing"} <span aria-hidden="true" className="ml-2">→</span></Link></aside>
    </article>
    {related.length > 0 && <section aria-labelledby="related-title" className="mx-auto max-w-7xl px-5 pb-14 sm:px-6"><h2 className="mb-6 text-2xl font-black" id="related-title">{locale === "vi" ? "Đọc tiếp" : "Keep reading"}</h2><div className="grid gap-6 md:grid-cols-2">{related.map(item => <ArticleCard image={null} key={item.id} locale={locale} post={item} />)}</div></section>}
  </>;
}
