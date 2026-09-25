import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/auth/session";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import type { BreadcrumbItem } from "@/lib/seo/structured-data";

export type Guide = {
  eyebrow: string;
  title: string;
  intro: string;
  topCta?: { href: string; label: string };
  sections: { title: string; paragraphs: string[]; points?: string[] }[];
  example?: { title: string; question: string; options: string[]; answer: string };
  links: { href: string; label: string; description: string }[];
  cta: { href: string; label: string; description: string };
};

export async function GuidePage({ guide, breadcrumbs }: { guide: Guide; breadcrumbs: readonly BreadcrumbItem[] }) {
  const user = await getCurrentUser();
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale="vi" signedIn={Boolean(user)} />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={breadcrumbs} />
      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-teal-800">{guide.eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">{guide.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">{guide.intro}</p>
        {guide.topCta && <Link className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-bold text-white" href={guide.topCta.href}>{guide.topCta.label} <span className="ml-3" aria-hidden="true">→</span></Link>}
      </header>
      <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-10">
          {guide.sections.map((section) => <section key={section.title}>
            <h2 className="text-2xl font-black leading-snug">{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p className="mt-4 leading-8 text-slate-700" key={paragraph}>{paragraph}</p>)}
            {section.points && <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}
          </section>)}
          {guide.example && <section className="rounded-2xl border border-teal-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black">{guide.example.title}</h2>
            <p className="mt-4 text-lg font-semibold leading-8">{guide.example.question}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">{guide.example.options.map((option) => <li className="rounded-lg bg-slate-100 px-4 py-3" key={option}>{option}</li>)}</ul>
            <details className="mt-5 rounded-lg border border-teal-300 bg-teal-50 p-4"><summary className="cursor-pointer font-bold text-teal-900">Xem đáp án và giải thích</summary><p className="mt-3 leading-7 text-slate-700">{guide.example.answer}</p></details>
          </section>}
        </div>
        <aside className="h-fit rounded-2xl bg-[#e7eee8] p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-black">Học tiếp theo chủ đề</h2>
          <ul className="mt-4 space-y-4">{guide.links.map((link) => <li key={link.href}><Link className="font-bold text-teal-900 underline" href={link.href}>{link.label}</Link><p className="mt-1 text-sm leading-6 text-slate-600">{link.description}</p></li>)}</ul>
        </aside>
      </div>
      <section className="mt-14 rounded-2xl bg-slate-900 p-7 text-white sm:p-10">
        <h2 className="text-2xl font-black">Áp dụng vào bài luyện</h2>
        <p className="mt-3 max-w-2xl leading-7 text-slate-200">{guide.cta.description}</p>
        <Link className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-teal-300 px-6 font-bold text-slate-950" href={guide.cta.href}>{guide.cta.label} <span className="ml-3" aria-hidden="true">→</span></Link>
        <p className="mt-4 text-xs text-slate-300">TOEIC GYM là nền tảng luyện tập độc lập, không liên kết với ETS. Kết quả luyện tập không phải điểm TOEIC chính thức.</p>
      </section>
    </article>
    <PublicFooter locale="vi" />
  </main>;
}
