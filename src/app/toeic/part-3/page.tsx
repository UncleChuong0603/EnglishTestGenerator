import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { PART3_ERROR_ROUTES, PART3_FORMAT, PART3_REVIEW_PASSES, part3StructuredData } from "@/lib/seo/part3-guide";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { serializeStructuredData } from "@/lib/seo/structured-data";
import { Part3Sample } from "./part-3-sample";

export const metadata = publicPageMetadata({
  title: "TOEIC Part 3: 39 câu hội thoại có audio, transcript",
  description: "Hiểu cấu trúc 39 câu TOEIC Part 3, nghe hội thoại tự biên soạn và làm 3 câu miễn phí. Có transcript, lời giải, bản đồ lỗi và cách nghe lại.",
  canonical: "/toeic/part-3",
});

const focusClass = "outline-offset-4 focus-visible:outline-3 focus-visible:outline-teal-800";

export default async function Page() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCookieLanguage()]);
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(part3StructuredData()) }} type="application/ld+json" />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: locale === "vi" ? "Trang chủ" : "Home", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: locale === "vi" ? "Luyện nghe" : "Listening", path: "/toeic/listening" }, { name: "Part 3", path: "/toeic/part-3" }]} />
      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-black uppercase tracking-[.16em] text-teal-800">TOEIC Listening · Part 3</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Luyện nghe TOEIC Part 3 bằng hội thoại và transcript</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">Part 3 gồm 39 câu theo 13 hội thoại. Mỗi hội thoại đi cùng ba câu hỏi; nhiệm vụ không chỉ là nghe ra từ mà còn theo dõi người nói, vấn đề, thay đổi và hành động tiếp theo.</p>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">Bài mẫu bên dưới có audio, ba câu hỏi, transcript và lời giải do TOEIC GYM tự biên soạn; mở được không cần tài khoản.</p>
        <Link className={`mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-black text-white hover:bg-teal-900 ${focusClass}`} href="#bai-nghe-mau">Nghe và làm 3 câu <span aria-hidden="true" className="ml-3">↓</span></Link>
      </header>

      <section aria-labelledby="format-title" className="mt-12">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Bản đồ Part 3</p><h2 className="mt-2 text-3xl font-black" id="format-title">39 câu được tổ chức như thế nào?</h2><p className="mt-4 leading-8 text-slate-700">Ba câu trong cùng một nhóm dùng chung hội thoại. Một số bài có ba người nói hoặc yêu cầu đối chiếu thông tin với hình ảnh; vì vậy, hãy đọc câu hỏi để biết loại bằng chứng cần giữ trước khi audio bắt đầu.</p></div>
        <dl className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-slate-300 bg-slate-300 sm:grid-cols-3">{PART3_FORMAT.map(([value, label]) => <div className="bg-white p-6" key={label}><dd className="text-3xl font-black tabular-nums text-teal-800">{value}</dd><dt className="mt-2 text-sm font-bold leading-6 text-slate-700">{label}</dt></div>)}</dl>
      </section>

      <section aria-labelledby="before-title" className="mt-14 grid gap-8 border-t border-slate-300 pt-10 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]">
        <div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Trước khi nghe</p><h2 className="mt-2 text-3xl font-black" id="before-title">Biến ba câu hỏi thành ba ô thông tin</h2><p className="mt-4 leading-8 text-slate-700">Đừng cố nhớ nguyên văn tất cả lựa chọn. Gọi tên nhiệm vụ của từng câu bằng vài từ để mắt và tai cùng tìm một loại thông tin.</p></div>
        <ol className="grid gap-4 sm:grid-cols-3"><li className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-sm font-black text-teal-800">Ô 1</span><h3 className="mt-2 font-black">Bối cảnh hoặc mục đích</h3><p className="mt-2 text-sm leading-6 text-slate-700">Ai đang nói, họ ở đâu và vì sao cuộc trao đổi diễn ra?</p></li><li className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-sm font-black text-teal-800">Ô 2</span><h3 className="mt-2 font-black">Chi tiết hoặc vấn đề</h3><p className="mt-2 text-sm leading-6 text-slate-700">Mốc giờ, vật, lỗi, thay đổi hay nguyên nhân nào được nêu?</p></li><li className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-sm font-black text-teal-800">Ô 3</span><h3 className="mt-2 font-black">Hành động tiếp theo</h3><p className="mt-2 text-sm leading-6 text-slate-700">Ai sẽ liên hệ, gửi, đặt lại, kiểm tra hoặc báo cho người khác?</p></li></ol>
      </section>

      <div className="mt-12"><Part3Sample /></div>

      <section aria-labelledby="error-title" className="mt-14 border-t border-slate-300 pt-10">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Chẩn đoán từ biểu hiện thật</p><h2 className="mt-2 text-3xl font-black" id="error-title">Nếu sai theo kiểu này, hãy sửa như sau</h2><p className="mt-4 leading-8 text-slate-700">“Nghe kém” chưa phải một chẩn đoán đủ cụ thể. Chọn biểu hiện gần nhất với câu bạn vừa làm để quyết định lượt nghe lại cần tập trung vào đâu.</p></div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">{PART3_ERROR_ROUTES.map((route, index) => <article className="border-l-4 border-teal-700 bg-white p-6" key={route.symptom}><p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Lỗi {index + 1}</p><h3 className="mt-3 text-lg font-black leading-7">“{route.symptom}”</h3><p className="mt-3 leading-7 text-slate-700"><strong>Nguyên nhân có thể:</strong> {route.cause}</p><p className="mt-2 leading-7 text-slate-700"><strong>Cách sửa:</strong> {route.repair}</p></article>)}</div>
      </section>

      <section aria-labelledby="review-title" className="mt-14 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] lg:gap-12"><div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-300">Review một hội thoại</p><h2 className="mt-2 text-3xl font-black" id="review-title">Dùng transcript sau khi đã thử bằng tai</h2><p className="mt-4 leading-7 text-slate-300">Transcript là công cụ tìm bằng chứng, không phải phụ đề cho lượt nghe đầu. Bốn lượt dưới đây giúp tách lỗi nghe âm khỏi lỗi hiểu ý.</p></div><ol className="grid gap-5 sm:grid-cols-2">{PART3_REVIEW_PASSES.map(([title, detail]) => <li className="border-l-2 border-teal-400 pl-4" key={title}><h3 className="font-black text-teal-200">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p></li>)}</ol></div>
      </section>

      <section aria-labelledby="next-title" className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,.85fr)]">
        <div><h2 className="text-3xl font-black" id="next-title">Khi nào nên chuyển sang bài dài hơn?</h2><p className="mt-4 leading-8 text-slate-700">Một hội thoại chỉ giúp bạn kiểm tra quy trình. Khi bạn trả lời được cả ba câu, chỉ ra đúng câu chứa bằng chứng và nghe lại không cần transcript, hãy thử nhiều nhóm Part 3 liên tiếp để kiểm tra khả năng chuyển nhanh giữa các bối cảnh.</p><p className="mt-4 leading-8 text-slate-700">Bài thử Listening công khai hiện dùng các nhóm Part 3 và hiển thị kết quả ngay sau khi nộp. Kết quả vẫn là độ chính xác luyện tập, không phải điểm TOEIC quy đổi.</p><Link className={`mt-5 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-black text-white hover:bg-teal-900 ${focusClass}`} href="/try#quick-practice">Làm bài Listening ngắn <span className="ml-3" aria-hidden="true">→</span></Link></div>
        <aside className="h-fit rounded-2xl border border-teal-200 bg-white p-6"><h2 className="text-xl font-black">Học tiếp theo lỗi</h2><ul className="mt-4 space-y-4 text-sm leading-6 text-slate-700"><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/blog/cach-luyen-nghe-toeic-part-3-4">Quy trình luyện Part 3–4</Link><span className="mt-1 block">Cách nghe lại, shadowing và dùng transcript có giới hạn.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/blog/toeic-part-3-hoi-thoai-ba-nguoi">Hội thoại ba người</Link><span className="mt-1 block">Theo dõi lượt lời và gắn hành động với đúng vai trò.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/part-4">Chuyển sang Part 4</Link><span className="mt-1 block">Luyện bài nói một người và phân biệt các mốc thời gian.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/listening">Bản đồ Listening Part 1–4</Link><span className="mt-1 block">Chọn Part theo kiểu lỗi đang gặp.</span></li></ul></aside>
      </section>

      <p className="mt-12 text-sm leading-6 text-slate-600">Cấu trúc và số câu được đối chiếu với <a className={`font-bold text-teal-800 underline underline-offset-4 ${focusClass}`} href="https://www.ets.org/toeic/about/listening-reading.html" rel="noopener noreferrer" target="_blank">mô tả TOEIC Listening &amp; Reading của ETS</a>. Audio, transcript, câu hỏi và lời giải mẫu do TOEIC GYM tự biên soạn; TOEIC GYM không liên kết hoặc được ETS bảo trợ.</p>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
