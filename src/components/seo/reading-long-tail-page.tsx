import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { ReadingSampleQuiz } from "@/components/seo/reading-sample-quiz";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import type { ReadingLongTailGuide } from "@/lib/seo/reading-long-tail";

export async function ReadingLongTailPage({ guide }: { guide: ReadingLongTailGuide }) {
  const [user, locale] = await Promise.all([getCurrentUser(), getCookieLanguage()]);
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: `Part ${guide.part}`, path: `/toeic/part-${guide.part}` }, { name: guide.breadcrumbLabel, path: guide.path }]} />
      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-teal-800">TOEIC Reading · Part {guide.part}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">{guide.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">{guide.intro}</p>
        <Link className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-bold text-white" href="#bai-tap-mau">Làm bài tập mẫu <span aria-hidden="true" className="ml-3">↓</span></Link>
      </header>
      <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-10">
          {guide.sections.map(section => <section key={section.title}>
            <h2 className="text-2xl font-black leading-snug">{section.title}</h2>
            {section.paragraphs.map(paragraph => <p className="mt-4 leading-8 text-slate-700" key={paragraph}>{paragraph}</p>)}
            {section.steps && <ol className="mt-4 list-decimal space-y-2 pl-6 leading-7 text-slate-700">{section.steps.map(step => <li key={step}>{step}</li>)}</ol>}
          </section>)}
          <section className="rounded-2xl border border-teal-200 bg-white p-5 sm:p-8" id="bai-tap-mau">
            <p className="text-sm font-bold uppercase tracking-wider text-teal-800">Bài tự biên soạn · không cần tài khoản</p>
            <h2 className="mt-2 text-2xl font-black">Thử bài đọc Part {guide.part}</h2>
            <p className="mt-3 leading-7 text-slate-700">Đọc tài liệu, chọn đáp án rồi kiểm tra lời giải. Mỗi lời giải chỉ ra câu chứa bằng chứng và lý do loại các phương án gây nhiễu.</p>
            <div className="mt-6 space-y-4">{guide.documents.map(document => <div className="rounded-xl border border-slate-200 bg-slate-50 p-5" key={document.label}>
              <h3 className="font-black text-slate-900">{document.label}</h3>
              {document.paragraphs.map(paragraph => <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700" key={paragraph}>{paragraph}</p>)}
            </div>)}</div>
            <ReadingSampleQuiz id={`reading-part-${guide.part}`} questions={guide.questions} />
          </section>
          <section><h2 className="text-2xl font-black">Sửa bài để lần sau làm nhanh hơn</h2><p className="mt-4 leading-8 text-slate-700">{guide.review}</p></section>
        </div>
        <aside className="h-fit rounded-2xl bg-[#e7eee8] p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-black">Học tiếp theo chủ đề</h2>
          <ul className="mt-4 space-y-4">{guide.related.map(link => <li key={link.href}><Link className="font-bold text-teal-900 underline" href={link.href}>{link.label}</Link><p className="mt-1 text-sm leading-6 text-slate-600">{link.description}</p></li>)}</ul>
        </aside>
      </div>
      <section className="mt-14 rounded-2xl bg-slate-900 p-7 text-white sm:p-10">
        <h2 className="text-2xl font-black">Luyện Reading dài hơn</h2>
        <p className="mt-3 max-w-2xl leading-7 text-slate-200">Bài mẫu giúp bạn tập một thao tác đọc. Khi đã giải thích được đáp án bằng câu trong tài liệu, hãy thử một nhóm câu Reading và xem lại lỗi sai.</p>
        <Link className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-teal-300 px-6 font-bold text-slate-950" href="/try#quick-practice">Thử bài Reading miễn phí →</Link>
      </section>
      <p className="mt-8 text-xs text-slate-600">Tài liệu và câu hỏi mẫu do TOEIC GYM tự biên soạn. TOEIC GYM không liên kết với ETS; bài mẫu không dự đoán điểm thi chính thức.</p>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
