import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { listPublishedPosts } from "@/lib/blog/service";
import { GRAMMAR_LEARNING_PATH } from "@/lib/blog/grammar-learning-path";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { getSiteUrl } from "@/lib/seo/site-url";

export const metadata = publicPageMetadata({
  title: "Ngữ pháp tiếng Anh từ cơ bản đến TOEIC: lộ trình học theo chủ điểm",
  description: "Lộ trình ngữ pháp tiếng Anh có ví dụ và bài tự kiểm tra: cấu trúc câu, danh từ, mạo từ, thì, câu bị động, modal verbs, mệnh đề, câu điều kiện và TOEIC Part 5–6.",
  canonical: "/blog/ngu-phap",
  socialTitle: "Lộ trình ngữ pháp tiếng Anh và TOEIC | TOEIC GYM",
  socialDescription: "Chọn đúng chủ điểm cần học, đọc ví dụ công việc và luyện lại trong câu hỏi TOEIC.",
  image: "/blog/cover/grammar",
});

export default async function GrammarHubPage() {
  const user = await getCurrentUser();
  const [preferences, posts] = await Promise.all([getPreferences(user?.id), listPublishedPosts(200)]);
  const locale = preferences.interfaceLanguage;
  const available = new Set(posts.filter(post => post.category === "GRAMMAR").map(post => post.slug));
  const units = GRAMMAR_LEARNING_PATH.map(unit => ({ ...unit, lessons: unit.lessons.filter(lesson => available.has(lesson.slug)) })).filter(unit => unit.lessons.length);
  const count = units.reduce((sum, unit) => sum + unit.lessons.length, 0);
  const base = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ngữ pháp tiếng Anh từ nền tảng đến TOEIC",
    url: `${base}/blog/ngu-phap`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: units.flatMap(unit => unit.lessons).map((lesson, index) => ({
        "@type": "ListItem", position: index + 1, name: lesson.label, url: `${base}/blog/${lesson.slug}`,
      })),
    },
  };

  return <main className="min-h-screen bg-[#f4f1e8] text-slate-950">
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6">
      <nav aria-label={locale === "vi" ? "Đường dẫn" : "Breadcrumb"} className="text-sm text-slate-600"><Link className="font-semibold text-teal-800 underline" href="/blog">{locale === "vi" ? "Kiến thức TOEIC" : "TOEIC Guides"}</Link><span className="mx-2">/</span>{locale === "vi" ? "Ngữ pháp" : "Grammar"}</nav>
      <header className="mt-8 rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14"><p className="text-xs font-black uppercase tracking-[.2em] text-teal-300">{locale === "vi" ? "Lộ trình học" : "Learning path"}</p><h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{locale === "vi" ? "Ngữ pháp tiếng Anh từ nền tảng đến TOEIC" : "English grammar from foundations to TOEIC"}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{locale === "vi" ? `Chọn một nhóm theo lỗi bạn đang gặp. ${count} bài học có ví dụ công việc, cách tránh bẫy và bài tự kiểm tra; học nền tảng trước rồi áp dụng vào Part 5–6.` : `Choose a topic based on your mistakes. Browse ${count} lessons with workplace examples and TOEIC practice.`}</p><div className="mt-7 flex flex-wrap gap-3"><Link className="rounded-lg bg-teal-300 px-5 py-3 font-bold text-slate-950" href="#nen-tang">{locale === "vi" ? "Bắt đầu từ nền tảng" : "Start with foundations"}</Link><Link className="rounded-lg border border-white/40 px-5 py-3 font-bold text-white" href="/blog/ngu-phap-toeic-part-5-can-hoc">{locale === "vi" ? "Ưu tiên ngữ pháp Part 5" : "Part 5 priorities"}</Link></div></header>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{units.map(unit => <a className="rounded-xl border border-slate-200 bg-white px-5 py-4 font-bold text-teal-900 hover:border-teal-600" href={`#${unit.id}`} key={unit.id}>{unit.title}<span className="mt-1 block text-sm font-medium text-slate-500">{unit.lessons.length} {locale === "vi" ? "bài" : "lessons"}</span></a>)}</div>
      <div className="mt-12 space-y-14">{units.map(unit => <section aria-labelledby={`${unit.id}-title`} id={unit.id} key={unit.id} className="scroll-mt-8"><div className="border-b border-slate-300 pb-5"><h2 className="text-3xl font-black" id={`${unit.id}-title`}>{unit.title}</h2><p className="mt-2 max-w-3xl leading-7 text-slate-600">{unit.intro}</p></div><div className="mt-5 grid gap-4 md:grid-cols-2">{unit.lessons.map((lesson, index) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={lesson.slug}><p className="text-xs font-black uppercase tracking-wider text-teal-700">{locale === "vi" ? "Bài" : "Lesson"} {index + 1}</p><h3 className="mt-2 text-xl font-black"><Link className="text-slate-950 underline-offset-4 hover:text-teal-800 hover:underline" href={`/blog/${lesson.slug}`}>{lesson.label}</Link></h3><p className="mt-2 leading-7 text-slate-600">{lesson.summary}</p><Link className="mt-4 inline-block font-bold text-teal-800 underline" href={`/blog/${lesson.slug}`}>{locale === "vi" ? "Đọc bài học" : "Read lesson"}</Link></article>)}</div></section>)}</div>
      <aside className="mt-14 rounded-2xl border border-teal-200 bg-teal-50 p-6"><h2 className="text-xl font-black">{locale === "vi" ? "Áp dụng vào câu hỏi thật trong question bank" : "Apply it in the question bank"}</h2><p className="mt-2 leading-7 text-slate-700">{locale === "vi" ? "Sau mỗi chủ điểm, làm một nhóm câu Part 5. Màn hình xem lại đáp án sẽ gợi ý bài ngữ pháp liên quan đến câu bạn vừa làm." : "After each topic, practice Part 5 questions and use the grammar links in your answer review."}</p><Link className="mt-4 inline-block font-bold text-teal-800 underline" href="/challenge/part-5">{locale === "vi" ? "Luyện Part 5" : "Practice Part 5"}</Link></aside>
    </div>
    <PublicFooter locale={locale} />
  </main>;
}
