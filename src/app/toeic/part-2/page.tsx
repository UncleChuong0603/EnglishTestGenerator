import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { ListeningSampleQuiz } from "@/components/seo/listening-sample-quiz";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { samplesForListeningPart } from "@/lib/seo/listening-samples";
import { PART2_ERROR_ROUTES, PART2_FORMAT, PART2_INTENT_MAP, PART2_REVIEW_PASSES, part2StructuredData } from "@/lib/seo/part2-guide";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { serializeStructuredData } from "@/lib/seo/structured-data";

export const metadata = publicPageMetadata({
  title: "TOEIC Part 2: 25 câu hỏi đáp có audio, transcript",
  description: "Hiểu cấu trúc 25 câu TOEIC Part 2 và luyện 4 câu hỏi–đáp miễn phí. Có audio, transcript, lời giải, phản hồi trực tiếp và gián tiếp.",
  canonical: "/toeic/part-2",
});

const focusClass = "outline-offset-4 focus-visible:outline-3 focus-visible:outline-teal-800";

export default async function Page() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCookieLanguage()]);
  const samples = samplesForListeningPart(2);
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(part2StructuredData()) }} type="application/ld+json" />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: locale === "vi" ? "Trang chủ" : "Home", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: locale === "vi" ? "Luyện nghe" : "Listening", path: "/toeic/listening" }, { name: "Part 2", path: "/toeic/part-2" }]} />
      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-black uppercase tracking-[.16em] text-teal-800">TOEIC Listening · Part 2</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Luyện nghe TOEIC Part 2 theo ý định hỏi–đáp</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">Part 2 gồm 25 câu. Ở mỗi câu, bạn nghe một câu hỏi hoặc câu nói rồi chọn phản hồi phù hợp nhất trong ba lựa chọn. Mấu chốt là nhận ra người nói đang cần gì, không phải săn một từ được lặp lại.</p>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">Bốn bài mẫu bên dưới đi từ câu trả lời trực tiếp tới ba kiểu phản hồi gián tiếp. Audio, transcript và lời giải do TOEIC GYM tự biên soạn; mở được không cần tài khoản.</p>
        <Link className={`mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-black text-white hover:bg-teal-900 ${focusClass}`} href="#bai-nghe-mau">Nghe và làm 4 câu <span aria-hidden="true" className="ml-3">↓</span></Link>
      </header>

      <section aria-labelledby="format-title" className="mt-12">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Bản đồ Part 2</p><h2 className="mt-2 text-3xl font-black" id="format-title">25 câu được tổ chức như thế nào?</h2><p className="mt-4 leading-8 text-slate-700">Không có câu hỏi và đáp án in sẵn để đọc trước. Vì vậy, hãy dùng những từ đầu tiên để xác định dạng câu, nhưng giữ đáp án mở cho tới khi hiểu chức năng của cả lời đáp.</p></div>
        <dl className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-slate-300 bg-slate-300 sm:grid-cols-3">{PART2_FORMAT.map(([value, label]) => <div className="bg-white p-6" key={label}><dd className="text-3xl font-black tabular-nums text-teal-800">{value}</dd><dt className="mt-2 text-sm font-bold leading-6 text-slate-700">{label}</dt></div>)}</dl>
      </section>

      <section aria-labelledby="intent-title" className="mt-14 border-t border-slate-300 pt-10">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Nghe chức năng, không ghép từ</p><h2 className="mt-2 text-3xl font-black" id="intent-title">Đổi tín hiệu đầu câu thành ý định hội thoại</h2><p className="mt-4 leading-8 text-slate-700">Các tín hiệu dưới đây giúp bạn tạo một giả thuyết nhanh, không phải công thức loại đáp án. Phản hồi đúng có thể nói thẳng, sửa tiền đề hoặc đưa ra bước tiếp theo hợp lý.</p></div>
        <ol className="mt-7 overflow-hidden rounded-2xl border border-slate-300 bg-white">{PART2_INTENT_MAP.map((item, index) => <li className="grid gap-3 border-b border-slate-200 p-5 last:border-b-0 sm:grid-cols-[4rem_13rem_minmax(0,1fr)] sm:items-start sm:p-6" key={item.cue}><span className="text-sm font-black tabular-nums text-teal-800">0{index + 1}</span><div><p className="text-sm font-black text-teal-800">{item.cue}</p><h3 className="mt-1 font-black leading-7">{item.intent}</h3></div><p className="leading-7 text-slate-700">{item.listenFor}</p></li>)}</ol>
      </section>

      <section aria-labelledby="practice-title" className="mt-14 border-t border-slate-300 pt-10">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Bốn mức phản hồi</p><h2 className="mt-2 text-3xl font-black" id="practice-title">Nghe trực tiếp trước, rồi mở rộng sang câu trả lời gián tiếp</h2><p className="mt-4 leading-8 text-slate-700">Làm từng câu khi chưa mở transcript. Sau khi nộp, hãy nói thành lời mối quan hệ giữa câu đầu và đáp án đúng; kết quả 1/1 chỉ cho biết lựa chọn, còn lời giải mới giúp bạn sửa cách nghe.</p></div>
        <div className="mt-8 space-y-8">{samples.map((sample) => <ListeningSampleQuiz key={sample.id} locale="vi" sample={sample} />)}</div>
      </section>

      <section aria-labelledby="error-title" className="mt-14 border-t border-slate-300 pt-10">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Chẩn đoán từ lựa chọn sai</p><h2 className="mt-2 text-3xl font-black" id="error-title">Nếu sai theo kiểu này, hãy sửa như sau</h2><p className="mt-4 leading-8 text-slate-700">Đừng ghi chung là “không nghe được”. Xác định thao tác nào đã kéo bạn khỏi ý định hội thoại để lần nghe lại có một mục tiêu kiểm chứng được.</p></div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">{PART2_ERROR_ROUTES.map((route, index) => <article className="border-l-4 border-teal-700 bg-white p-6" key={route.symptom}><p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Lỗi {index + 1}</p><h3 className="mt-3 text-lg font-black leading-7">“{route.symptom}”</h3><p className="mt-3 leading-7 text-slate-700"><strong>Nguyên nhân có thể:</strong> {route.cause}</p><p className="mt-2 leading-7 text-slate-700"><strong>Cách sửa:</strong> {route.repair}</p></article>)}</div>
      </section>

      <section aria-labelledby="review-title" className="mt-14 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] lg:gap-12"><div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-300">Review một câu hỏi–đáp</p><h2 className="mt-2 text-3xl font-black" id="review-title">Dùng transcript để gọi đúng tên quan hệ</h2><p className="mt-4 leading-7 text-slate-300">Transcript nên xuất hiện sau lần chọn đầu tiên. Bốn lượt này tách lỗi không nhận ra âm khỏi lỗi đã nghe được từ nhưng hiểu sai chức năng.</p></div><ol className="grid gap-5 sm:grid-cols-2">{PART2_REVIEW_PASSES.map(([title, detail]) => <li className="border-l-2 border-teal-400 pl-4" key={title}><h3 className="font-black text-teal-200">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p></li>)}</ol></div>
      </section>

      <section aria-labelledby="next-title" className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,.85fr)]">
        <div><h2 className="text-3xl font-black" id="next-title">Khi nào nên chuyển sang hội thoại Part 3?</h2><p className="mt-4 leading-8 text-slate-700">Bốn câu mẫu giúp kiểm tra thao tác nghe ngắn. Khi bạn xác định được ý định, giải thích phản hồi bằng bằng chứng và nghe lại không cần transcript, hãy sang Part 3 để giữ cùng thao tác qua nhiều lượt lời.</p><p className="mt-4 leading-8 text-slate-700">Nếu vẫn sai vì lặp từ hoặc vì chờ câu trả lời quá trực tiếp, hãy làm lại bốn câu theo một thứ tự khác và ghi chức năng của từng đáp án đúng trước khi tăng độ dài.</p><Link className={`mt-5 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-black text-white hover:bg-teal-900 ${focusClass}`} href="/toeic/part-3">Luyện tiếp Part 3 <span className="ml-3" aria-hidden="true">→</span></Link></div>
        <aside className="h-fit rounded-2xl border border-teal-200 bg-white p-6"><h2 className="text-xl font-black">Học tiếp theo lỗi</h2><ul className="mt-4 space-y-4 text-sm leading-6 text-slate-700"><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/blog/meo-lam-toeic-part-2-hoi-dap">Bảy dạng hỏi–đáp Part 2</Link><span className="mt-1 block">Mở rộng tín hiệu đầu câu và chức năng thường gặp.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/blog/toeic-part-2-cau-tra-loi-gian-tiep">Câu trả lời gián tiếp Part 2</Link><span className="mt-1 block">Luyện sâu cách nhận ra hàm ý mà không suy diễn quá mức.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/listening">Bản đồ Listening Part 1–4</Link><span className="mt-1 block">Chọn Part tiếp theo theo kiểu lỗi đang gặp.</span></li></ul></aside>
      </section>

      <p className="mt-12 text-sm leading-6 text-slate-600">Cấu trúc và số câu được đối chiếu với <a className={`font-bold text-teal-800 underline underline-offset-4 ${focusClass}`} href="https://www.ets.org/toeic/about/listening-reading.html" rel="noopener noreferrer" target="_blank">mô tả TOEIC Listening &amp; Reading của ETS</a>. Audio, transcript, câu hỏi và lời giải mẫu do TOEIC GYM tự biên soạn; TOEIC GYM không liên kết hoặc được ETS bảo trợ.</p>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
