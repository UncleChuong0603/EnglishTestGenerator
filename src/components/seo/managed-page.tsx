import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getPublishedPost, getPostRedirect } from "@/lib/blog/service";
import { contentPath } from "@/lib/seo/routes";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { practiceForSlug } from "@/lib/seo/mini-practice";
import { practiceStructuredData } from "@/lib/seo/practice-structured-data";
import { serializeStructuredData } from "@/lib/seo/structured-data";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Markdown } from "@/components/blog/markdown";
import { BreadcrumbTrail } from "./breadcrumb-trail";
import { MiniPractice } from "./mini-practice";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { ToeicFormatTable } from "./toeic-format-table";

export async function managedMetadata(slug: string): Promise<Metadata> {
  const destination = await getPostRedirect(slug);
  if (destination) permanentRedirect(destination);
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const metadata = publicPageMetadata({ title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt,
    canonical: post.canonicalPath || contentPath(slug), socialTitle: post.socialTitle || undefined, socialDescription: post.socialDescription || undefined });
  return { ...metadata, robots: post.noindex ? { index: false, follow: true } : metadata.robots };
}

export async function ManagedPage({ slug }: { slug: string }) {
  const destination = await getPostRedirect(slug);
  if (destination) permanentRedirect(destination);
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const user = await getCurrentUser();
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  const vi = locale === "vi";
  const path = contentPath(slug);
  const questions = practiceForSlug(slug);
  const structuredData = questions.length ? practiceStructuredData({
    path,
    title: post.title,
    description: post.seoDescription || post.excerpt,
    questionCount: questions.length,
  }) : null;
  const readingSample = slug === "seo-part6"
    ? { href: "/toeic/part-6/dien-cau-vao-doan-van", label: "Làm bài điền câu Part 6" }
    : slug === "seo-part7"
      ? { href: "/toeic/part-7/doc-hieu-mot-doan-van", label: "Làm bài đọc một văn bản Part 7" }
      : { href: "/toeic/part-5/practice", label: "Luyện Part 5 miễn phí" };
  const crumbs = [{ name: "Trang chủ", path: "/" },
    ...(path === "/toeic" ? [] : [{ name: "TOEIC", path: "/toeic" }]),
    ...(path.startsWith("/toeic/part-5/") ? [{ name: "Part 5", path: "/toeic/part-5" }] : []),
    { name: post.title, path }];
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <a className="sr-only z-[60] rounded-md bg-white px-4 py-3 font-bold text-teal-800 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700" href="#managed-content">{vi ? "Bỏ qua điều hướng" : "Skip to content"}</a>
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <article id="managed-content" lang="vi" className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
      {structuredData && <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }} type="application/ld+json" />}
      <BreadcrumbTrail items={crumbs} />
      <header className="mt-7"><h1 className="text-4xl font-black leading-tight sm:text-5xl">{post.title}</h1><p className="mt-5 text-lg leading-8 text-slate-700">{post.excerpt}</p></header>
      {slug === "seo-part5-practice" && <section aria-label={vi ? "Thông tin bài luyện" : "Practice details"} className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div>
          <p className="font-black text-slate-950">{vi ? "7 câu · khoảng 5–7 phút · có lời giải từng lựa chọn" : "7 questions · about 5–7 minutes · every option explained"}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{vi ? "Làm và xem kết quả ngay, không cần tài khoản." : "Practice and see your result immediately, with no account required."}</p>
        </div>
        <Link className="mt-4 inline-flex min-h-12 shrink-0 items-center rounded-lg bg-teal-800 px-5 font-bold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 sm:mt-0" href="#bai-tap">{vi ? "Bắt đầu làm 7 câu" : "Start 7 questions"}</Link>
      </section>}
      {slug === "seo-toeic" && <ToeicFormatTable />}
      {questions.length ? <MiniPractice questions={questions} locale={locale} signedIn={Boolean(user)} /> : <Link className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-5 font-bold text-white" href={readingSample.href}>{readingSample.label}</Link>}
      <Markdown content={post.content} />
      <nav aria-label="Luyện tập tiếp" className="mt-10 flex flex-wrap gap-5 border-t border-slate-300 pt-6 font-bold text-teal-800">
        {slug === "seo-part6" ? <><Link href="/toeic/part-6/dien-cau-vao-doan-van">Điền câu vào đoạn Part 6</Link><Link href="/toeic/part-7">Học tiếp Part 7</Link></>
          : slug === "seo-part7" ? <><Link href="/toeic/part-7/doc-hieu-mot-doan-van">Đọc một văn bản Part 7</Link><Link href="/toeic/part-7/doc-hieu-hai-doan-van">Đọc hai văn bản Part 7</Link><Link href="/toeic/part-6">Ôn lại Part 6</Link></>
            : <><Link href="/toeic/part-5">Chọn chủ điểm Part 5</Link><Link href="/challenge/part-5">Bắt đầu Challenge</Link></>}
        <Link href="/blog">Thư viện hướng dẫn</Link>
      </nav>
      <p className="mt-8 text-sm text-slate-600">TOEICGym là nền tảng luyện tập độc lập, không liên kết với ETS/IIG. Bài luyện không quy đổi thành điểm thi TOEIC.</p>
    </article><PublicFooter locale={locale} />
  </main>;
}
