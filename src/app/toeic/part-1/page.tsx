import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { ListeningSampleQuiz } from "@/components/seo/listening-sample-quiz";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { PART1_ERROR_ROUTES, PART1_FORMAT, PART1_REVIEW_PASSES, PART1_SCAN_LAYERS, part1StructuredData } from "@/lib/seo/part1-guide";
import { listeningSamples } from "@/lib/seo/listening-samples";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { serializeStructuredData } from "@/lib/seo/structured-data";

export const metadata = publicPageMetadata({
  title: "TOEIC Part 1: 6 câu mô tả tranh có audio, lời giải",
  description: "Hiểu cấu trúc 6 câu TOEIC Part 1, quan sát ảnh gốc và nghe 4 mô tả miễn phí. Có transcript, lời giải, bản đồ bẫy và cách review bằng chứng.",
  canonical: "/toeic/part-1",
  image: "/seo/toeic-part-1-office-folders.webp",
});

const focusClass = "outline-offset-4 focus-visible:outline-3 focus-visible:outline-teal-800";

export default async function Page() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCookieLanguage()]);
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(part1StructuredData()) }} type="application/ld+json" />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: locale === "vi" ? "Trang chủ" : "Home", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: locale === "vi" ? "Luyện nghe" : "Listening", path: "/toeic/listening" }, { name: "Part 1", path: "/toeic/part-1" }]} />
      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-black uppercase tracking-[.16em] text-teal-800">TOEIC Listening · Part 1</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Luyện nghe TOEIC Part 1 bằng ảnh và audio</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">Part 1 gồm 6 câu mô tả tranh. Với mỗi ảnh, bạn nghe bốn câu tiếng Anh và chọn câu phù hợp nhất; đáp án chỉ đúng khi chủ thể, hành động hoặc trạng thái và vị trí đều khớp bằng chứng nhìn thấy.</p>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">Bài mẫu bên dưới dùng ảnh, audio, transcript và lời giải do TOEIC GYM tự tạo; mở được không cần tài khoản.</p>
        <Link className={`mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-black text-white hover:bg-teal-900 ${focusClass}`} href="#bai-nghe-mau">Xem ảnh và nghe thử <span aria-hidden="true" className="ml-3">↓</span></Link>
      </header>

      <section aria-labelledby="format-title" className="mt-12">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Bản đồ Part 1</p><h2 className="mt-2 text-3xl font-black" id="format-title">6 câu được tổ chức như thế nào?</h2><p className="mt-4 leading-8 text-slate-700">Ảnh xuất hiện cùng số câu, còn bốn lựa chọn được phát bằng audio. Trước khi nghe, mục tiêu không phải gọi tên mọi vật mà là tạo vài dự đoán có thể kiểm chứng ngay bằng mắt.</p></div>
        <dl className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-slate-300 bg-slate-300 sm:grid-cols-3">{PART1_FORMAT.map(([value, label]) => <div className="bg-white p-6" key={label}><dd className="text-3xl font-black tabular-nums text-teal-800">{value}</dd><dt className="mt-2 text-sm font-bold leading-6 text-slate-700">{label}</dt></div>)}</dl>
      </section>

      <section aria-labelledby="scan-title" className="mt-14 border-t border-slate-300 pt-10">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Trước khi audio bắt đầu</p><h2 className="mt-2 text-3xl font-black" id="scan-title">Quét ảnh theo bốn lớp bằng chứng</h2><p className="mt-4 leading-8 text-slate-700">Đi từ điều chắc chắn tới điều chi tiết. Nếu ảnh không có người, bỏ lớp hành động của người và tập trung vào trạng thái cùng quan hệ không gian.</p></div>
        <ol className="mt-7 overflow-hidden rounded-2xl border border-slate-300 bg-white">{PART1_SCAN_LAYERS.map((layer, index) => <li className="grid gap-3 border-b border-slate-200 p-5 last:border-b-0 sm:grid-cols-[4rem_10rem_minmax(0,1fr)] sm:items-start sm:p-6" key={layer.label}><span className="text-sm font-black tabular-nums text-teal-800">0{index + 1}</span><h3 className="font-black">{layer.label}</h3><div><p className="font-bold leading-7 text-slate-800">{layer.question}</p><p className="mt-2 text-sm leading-6 text-slate-600">{layer.note}</p></div></li>)}</ol>
      </section>

      <div className="mt-12"><ListeningSampleQuiz locale="vi" sample={listeningSamples[1]} /></div>

      <section aria-labelledby="error-title" className="mt-14 border-t border-slate-300 pt-10">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Chẩn đoán từ lựa chọn sai</p><h2 className="mt-2 text-3xl font-black" id="error-title">Nếu sai theo kiểu này, hãy sửa như sau</h2><p className="mt-4 leading-8 text-slate-700">Part 1 không chỉ kiểm tra từ vựng đồ vật. Hãy xác định phần nào của câu mô tả kéo bạn đi sai để lượt nghe lại có một mục tiêu cụ thể.</p></div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">{PART1_ERROR_ROUTES.map((route, index) => <article className="border-l-4 border-teal-700 bg-white p-6" key={route.symptom}><p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Lỗi {index + 1}</p><h3 className="mt-3 text-lg font-black leading-7">“{route.symptom}”</h3><p className="mt-3 leading-7 text-slate-700"><strong>Nguyên nhân có thể:</strong> {route.cause}</p><p className="mt-2 leading-7 text-slate-700"><strong>Cách sửa:</strong> {route.repair}</p></article>)}</div>
      </section>

      <section aria-labelledby="review-title" className="mt-14 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] lg:gap-12"><div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-300">Review một bức ảnh</p><h2 className="mt-2 text-3xl font-black" id="review-title">Dùng transcript để gọi đúng tên lỗi</h2><p className="mt-4 leading-7 text-slate-300">Transcript chỉ nên mở sau khi đã nhìn và nghe. Mục tiêu là nối âm thanh với đúng chi tiết trong ảnh, không phải học thuộc câu mô tả.</p></div><ol className="grid gap-5 sm:grid-cols-2">{PART1_REVIEW_PASSES.map(([title, detail]) => <li className="border-l-2 border-teal-400 pl-4" key={title}><h3 className="font-black text-teal-200">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p></li>)}</ol></div>
      </section>

      <section aria-labelledby="next-title" className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,.85fr)]">
        <div><h2 className="text-3xl font-black" id="next-title">Khi nào nên luyện nhiều ảnh liên tiếp?</h2><p className="mt-4 leading-8 text-slate-700">Một ảnh giúp bạn kiểm tra thao tác. Khi chọn đúng, chỉ ra được vì sao cả ba câu còn lại sai và nghe lại không cần transcript, hãy chuyển sang sáu ảnh liên tiếp để luyện nhịp của toàn Part 1.</p><p className="mt-4 leading-8 text-slate-700">Nếu lỗi chủ yếu nằm ở câu hỏi–phản hồi thay vì mô tả hình ảnh, hãy chuyển sang Part 2. Nếu bạn muốn chọn lại theo nguyên nhân sai, mở bản đồ Listening Part 1–4.</p><Link className={`mt-5 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-black text-white hover:bg-teal-900 ${focusClass}`} href="/toeic/part-2">Luyện tiếp Part 2 <span className="ml-3" aria-hidden="true">→</span></Link></div>
        <aside className="h-fit rounded-2xl border border-teal-200 bg-white p-6"><h2 className="text-xl font-black">Học tiếp theo lỗi</h2><ul className="mt-4 space-y-4 text-sm leading-6 text-slate-700"><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/blog/meo-lam-toeic-part-1-mo-ta-tranh">Mẹo làm Part 1 theo tranh</Link><span className="mt-1 block">Ví dụ riêng cho tranh người, tranh vật, giới từ và bẫy hành động.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/blog/noi-am-tieng-anh-cach-nghe-connected-speech">Nghe giới từ trong dòng nói</Link><span className="mt-1 block">Luyện connected speech khi thường bỏ lỡ từ ngắn.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/listening">Bản đồ Listening Part 1–4</Link><span className="mt-1 block">Chọn dạng nghe theo lỗi đang gặp.</span></li></ul></aside>
      </section>

      <p className="mt-12 text-sm leading-6 text-slate-600">Cấu trúc và số câu được đối chiếu với <a className={`font-bold text-teal-800 underline underline-offset-4 ${focusClass}`} href="https://www.ets.org/toeic/about/listening-reading.html" rel="noopener noreferrer" target="_blank">mô tả TOEIC Listening &amp; Reading của ETS</a>. Ảnh, audio, transcript, câu hỏi và lời giải mẫu do TOEIC GYM tự tạo; TOEIC GYM không liên kết hoặc được ETS bảo trợ.</p>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
