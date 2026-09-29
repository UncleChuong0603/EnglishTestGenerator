import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { ListeningSampleQuiz } from "@/components/seo/listening-sample-quiz";
import { getCurrentUser } from "@/lib/auth/session";
import type { ListeningGuide } from "@/lib/seo/listening-guides";
import { listeningSamples } from "@/lib/seo/listening-samples";

export async function ListeningGuidePage({ guide }: { guide: ListeningGuide }) {
  const user = await getCurrentUser();
  const path = `/toeic/part-${guide.part}`;
  const related = [1, 2, 3, 4].filter(part => part !== guide.part);
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale="vi" signedIn={Boolean(user)} />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: "Luyện nghe", path: "/toeic/listening" }, { name: `Part ${guide.part}`, path }]} />
      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-teal-800">TOEIC Listening · Part {guide.part}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">{guide.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">{guide.intro}</p>
        <Link className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-bold text-white" href="#bai-nghe-mau">Nghe và làm bài mẫu <span aria-hidden="true" className="ml-3">↓</span></Link>
      </header>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-9 leading-8 text-slate-700">
          {guide.sections.slice(0, 2).map(section => <section key={section.heading}><h2 className="text-2xl font-black text-slate-900">{section.heading}</h2><p className="mt-4">{section.body}</p></section>)}
          <ListeningSampleQuiz sample={listeningSamples[guide.part]} />
          <section><h2 className="text-2xl font-black text-slate-900">{guide.sections[2].heading}</h2><p className="mt-4">{guide.sections[2].body}</p></section>
          <section className="rounded-xl bg-teal-50 p-6"><h2 className="text-xl font-black text-teal-950">Dấu hiệu cần nhớ trong bài mẫu</h2><p className="mt-3">{guide.review}</p></section>
        </div>
        <aside className="h-fit rounded-2xl bg-[#e7eee8] p-6 lg:sticky lg:top-6"><h2 className="text-lg font-black">Luyện tiếp</h2><ul className="mt-4 space-y-4">{related.map(part => <li key={part}><Link className="font-bold text-teal-900 underline" href={`/toeic/part-${part}`}>Listening Part {part}</Link></li>)}<li><Link className="font-bold text-teal-900 underline" href="/toeic/listening">Lộ trình luyện nghe</Link></li><li><Link className="font-bold text-teal-900 underline" href="/blog/cach-luyen-nghe-toeic-part-3-4">Cách nghe lại và sửa lỗi</Link></li></ul></aside>
      </div>
      <section className="mt-14 rounded-2xl bg-slate-900 p-7 text-white sm:p-10"><h2 className="text-2xl font-black">Thử bài Listening dài hơn</h2><p className="mt-3 max-w-2xl leading-7 text-slate-200">Bài thử miễn phí hiện gồm nhóm câu Part 3. Sau bài mẫu này, hãy kiểm tra khả năng theo dõi hội thoại và xem kết quả theo Part.</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-teal-300 px-6 font-bold text-slate-950" href="/try#quick-practice">Làm bài thử Listening <span className="ml-3" aria-hidden="true">→</span></Link></section>
      <p className="mt-8 text-sm text-slate-600">Ảnh (Part 1), audio, câu hỏi và lời giải mẫu do TOEIC GYM tạo riêng. TOEIC GYM không liên kết với ETS; kết quả bài mẫu không phải điểm TOEIC chính thức.</p>
    </article><PublicFooter locale="vi" />
  </main>;
}
