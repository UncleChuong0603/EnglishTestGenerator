import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getPublishedPost, getPostRedirect } from "@/lib/blog/service";
import { contentPath } from "@/lib/seo/routes";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { practiceForSlug } from "@/lib/seo/mini-practice";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Markdown } from "@/components/blog/markdown";
import { BreadcrumbTrail } from "./breadcrumb-trail";
import { MiniPractice } from "./mini-practice";
import { getCurrentUser } from "@/lib/auth/session";

export async function managedMetadata(slug: string): Promise<Metadata> {
  const destination = await getPostRedirect(slug);
  if (destination) permanentRedirect(destination);
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  return { ...publicPageMetadata({ title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt,
    canonical: post.canonicalPath || contentPath(slug), socialTitle: post.socialTitle || undefined, socialDescription: post.socialDescription || undefined }),
    robots: post.noindex ? { index: false, follow: true } : { index: true, follow: true } };
}

export async function ManagedPage({ slug }: { slug: string }) {
  const destination = await getPostRedirect(slug);
  if (destination) permanentRedirect(destination);
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const user = await getCurrentUser();
  const path = contentPath(slug);
  const questions = practiceForSlug(slug);
  const crumbs = [{ name: "Trang chủ", path: "/" },
    ...(path === "/toeic" ? [] : [{ name: "TOEIC", path: "/toeic" }]),
    ...(path.startsWith("/toeic/part-5/") ? [{ name: "Part 5", path: "/toeic/part-5" }] : []),
    { name: post.title, path }];
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale="vi" signedIn={Boolean(user)} />
    <article lang="vi" className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
      <BreadcrumbTrail items={crumbs} />
      <header className="mt-7"><h1 className="text-4xl font-black leading-tight sm:text-5xl">{post.title}</h1><p className="mt-5 text-lg leading-8 text-slate-700">{post.excerpt}</p></header>
      {questions.length ? <MiniPractice questions={questions} /> : <Link className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-5 font-bold text-white" href="/toeic/part-5/practice">Luyện Part 5 miễn phí</Link>}
      <Markdown content={post.content} />
      <nav aria-label="Luyện tập tiếp" className="mt-10 flex flex-wrap gap-5 border-t border-slate-300 pt-6 font-bold text-teal-800">
        <Link href="/toeic/part-5">Chọn chủ điểm Part 5</Link><Link href="/challenge/part-5">Bắt đầu Challenge</Link><Link href="/blog">Thư viện hướng dẫn</Link>
      </nav>
      <p className="mt-8 text-sm text-slate-600">TOEICGym là nền tảng luyện tập độc lập, không liên kết với ETS/IIG. Bài luyện không quy đổi thành điểm thi TOEIC.</p>
    </article><PublicFooter locale="vi" />
  </main>;
}
