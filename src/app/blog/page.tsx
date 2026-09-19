import type { Metadata } from "next";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArticleCard } from "@/components/blog/article-card";
import { getCurrentUser } from "@/lib/auth/session";
import { listPublishedPosts, coverUrl } from "@/lib/blog/service";
import { getPreferences } from "@/lib/i18n/get-translations";

export const metadata: Metadata = { title: "Kiến thức TOEIC", description: "Chiến lược, ngữ pháp, từ vựng và mẹo luyện thi TOEIC từ TOEICGym.", alternates: { canonical: "/blog" }, openGraph: { title: "Kiến thức TOEIC | TOEICGym", description: "Hướng dẫn TOEIC thực tế để học hiệu quả hơn.", type: "website" } };

export default async function BlogPage() {
  const user = await getCurrentUser();
  const [prefs, posts] = await Promise.all([getPreferences(user?.id), listPublishedPosts()]);
  const locale = prefs.interfaceLanguage;
  const cards = await Promise.all(posts.map(async post => ({ post, image: await coverUrl(post.coverMediaId) })));
  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14">
      <p className="text-sm font-black uppercase tracking-[.16em] text-teal-700">TOEIC GYM · {locale === "vi" ? "KIẾN THỨC" : "GUIDES"}</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{locale === "vi" ? "Kiến thức TOEIC" : "TOEIC Guides"}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{locale === "vi" ? "Hướng dẫn thực tế giúp bạn hiểu bài, luyện đúng trọng tâm và tiến bộ bền vững." : "Practical guides to help you understand, focus your practice and improve steadily."}</p>
    </div></header>
    <section aria-label={locale === "vi" ? "Bài viết" : "Articles"} className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12">
      {cards.length ? <div className={cards.length === 1 ? "grid" : cards.length === 2 ? "grid gap-6 md:grid-cols-2" : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"}>
        {cards.map(({ post, image }) => <ArticleCard featured={cards.length === 1} image={image} key={post.id} locale={locale} post={post} />)}
      </div> : <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center sm:py-16"><h2 className="text-2xl font-black">{locale === "vi" ? "Chưa có bài viết" : "No articles yet"}</h2><p className="mt-3 text-slate-600">{locale === "vi" ? "Các hướng dẫn TOEIC mới sẽ xuất hiện tại đây." : "New TOEIC guides will appear here."}</p></div>}
    </section>
    <PublicFooter locale={locale} />
  </main>;
}
