import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { ListeningSampleQuiz } from "@/components/seo/listening-sample-quiz";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { listeningSamples } from "@/lib/seo/listening-samples";
import { PART4_ERROR_ROUTES, PART4_FORMAT, PART4_REVIEW_PASSES, PART4_TALK_MAP, part4StructuredData } from "@/lib/seo/part4-guide";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { serializeStructuredData } from "@/lib/seo/structured-data";

export const metadata = publicPageMetadata({
  title: "TOEIC Part 4: 30 câu bài nói có audio, transcript",
  description: "Hiểu cấu trúc 30 câu TOEIC Part 4, nghe bài nói tự biên soạn và làm 3 câu miễn phí. Có transcript, lời giải, bản đồ dạng bài và cách sửa lỗi.",
  canonical: "/toeic/part-4",
});

const focusClass = "outline-offset-4 focus-visible:outline-3 focus-visible:outline-teal-800";

export default async function Page() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCookieLanguage()]);
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(part4StructuredData()) }} type="application/ld+json" />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: locale === "vi" ? "Trang chủ" : "Home", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: locale === "vi" ? "Luyện nghe" : "Listening", path: "/toeic/listening" }, { name: "Part 4", path: "/toeic/part-4" }]} />
      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-black uppercase tracking-[.16em] text-teal-800">TOEIC Listening · Part 4</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Luyện nghe TOEIC Part 4 bằng bài nói và transcript</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">Part 4 gồm 30 câu theo 10 bài nói. Mỗi bài do một người nói và đi cùng ba câu hỏi; bạn cần nhận ra mục đích, gắn đúng vai trò cho chi tiết và theo kịp điểm thay đổi.</p>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">Bài mẫu bên dưới có audio, ba câu hỏi, transcript và lời giải do TOEIC GYM tự biên soạn; mở được không cần tài khoản.</p>
        <Link className={`mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-black text-white hover:bg-teal-900 ${focusClass}`} href="#bai-nghe-mau">Nghe và làm 3 câu <span aria-hidden="true" className="ml-3">↓</span></Link>
      </header>

      <section aria-labelledby="format-title" className="mt-12">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Bản đồ Part 4</p><h2 className="mt-2 text-3xl font-black" id="format-title">30 câu được tổ chức như thế nào?</h2><p className="mt-4 leading-8 text-slate-700">Ba câu trong cùng một nhóm dùng chung bài nói. Một số câu yêu cầu nối audio với hình ảnh hoặc bảng biểu; vì vậy, hãy đọc trước để biết mình cần giữ mục đích, chi tiết hay hành động tiếp theo.</p></div>
        <dl className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-slate-300 bg-slate-300 sm:grid-cols-3">{PART4_FORMAT.map(([value, label]) => <div className="bg-white p-6" key={label}><dd className="text-3xl font-black tabular-nums text-teal-800">{value}</dd><dt className="mt-2 text-sm font-bold leading-6 text-slate-700">{label}</dt></div>)}</dl>
      </section>

      <section aria-labelledby="talk-map-title" className="mt-14 border-t border-slate-300 pt-10">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Định vị ngay từ câu mở đầu</p><h2 className="mt-2 text-3xl font-black" id="talk-map-title">Nghe loại bài nói trước, rồi mới giữ chi tiết</h2><p className="mt-4 leading-8 text-slate-700">Tên dạng không phải đáp án, nhưng nó tạo một khung dự đoán. Khi đã biết mình đang nghe thông báo, lời nhắn hay hướng dẫn, bạn sẽ dễ gắn thời gian và hành động vào đúng vai trò hơn.</p></div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">{PART4_TALK_MAP.map((item, index) => <article className="border-l-4 border-teal-700 bg-white p-6" key={item.type}><p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Khung {index + 1}</p><h3 className="mt-3 text-xl font-black">{item.type}</h3><p className="mt-3 leading-7 text-slate-700"><strong>Câu mở đầu:</strong> {item.opening}</p><p className="mt-2 leading-7 text-slate-700"><strong>Bằng chứng cần giữ:</strong> {item.evidence}</p></article>)}</div>
      </section>

      <section aria-labelledby="before-title" className="mt-14 grid gap-8 border-t border-slate-300 pt-10 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]">
        <div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Trước khi nghe</p><h2 className="mt-2 text-3xl font-black" id="before-title">Biến ba câu hỏi thành ba nhiệm vụ</h2><p className="mt-4 leading-8 text-slate-700">Đừng cố thuộc toàn bộ lựa chọn. Hãy rút mỗi câu thành một nhãn ngắn để mắt biết phải chờ loại bằng chứng nào.</p></div>
        <ol className="grid gap-4 sm:grid-cols-3"><li className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-sm font-black text-teal-800">Nhiệm vụ 1</span><h3 className="mt-2 font-black">Loại bài và mục đích</h3><p className="mt-2 text-sm leading-6 text-slate-700">Người nói đang thông báo, giới thiệu, hướng dẫn hay yêu cầu điều gì?</p></li><li className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-sm font-black text-teal-800">Nhiệm vụ 2</span><h3 className="mt-2 font-black">Mốc có vai trò</h3><p className="mt-2 text-sm leading-6 text-slate-700">Đó là lịch cũ, lịch mới, địa điểm, giá hay hạn chót?</p></li><li className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-sm font-black text-teal-800">Nhiệm vụ 3</span><h3 className="mt-2 font-black">Việc cần làm</h3><p className="mt-2 text-sm leading-6 text-slate-700">Người nghe cần mang, gửi, đăng ký, gọi lại hay đến đâu?</p></li></ol>
      </section>

      <div className="mt-12"><ListeningSampleQuiz locale="vi" sample={listeningSamples[4]} /></div>

      <section aria-labelledby="error-title" className="mt-14 border-t border-slate-300 pt-10">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Chẩn đoán từ biểu hiện thật</p><h2 className="mt-2 text-3xl font-black" id="error-title">Nếu sai theo kiểu này, hãy sửa như sau</h2><p className="mt-4 leading-8 text-slate-700">Đừng chỉ ghi “nghe kém”. Chọn biểu hiện gần nhất để lượt nghe lại có một mục tiêu cụ thể và kiểm chứng được.</p></div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">{PART4_ERROR_ROUTES.map((route, index) => <article className="border-l-4 border-teal-700 bg-white p-6" key={route.symptom}><p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Lỗi {index + 1}</p><h3 className="mt-3 text-lg font-black leading-7">“{route.symptom}”</h3><p className="mt-3 leading-7 text-slate-700"><strong>Nguyên nhân có thể:</strong> {route.cause}</p><p className="mt-2 leading-7 text-slate-700"><strong>Cách sửa:</strong> {route.repair}</p></article>)}</div>
      </section>

      <section aria-labelledby="review-title" className="mt-14 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] lg:gap-12"><div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-300">Review một bài nói</p><h2 className="mt-2 text-3xl font-black" id="review-title">Dùng transcript để gắn vai trò cho thông tin</h2><p className="mt-4 leading-7 text-slate-300">Mục tiêu không phải đọc hiểu transcript. Bốn lượt dưới đây giúp bạn xác định chính xác vì sao một mốc hoặc hành động bị hiểu sai khi nghe.</p></div><ol className="grid gap-5 sm:grid-cols-2">{PART4_REVIEW_PASSES.map(([title, detail]) => <li className="border-l-2 border-teal-400 pl-4" key={title}><h3 className="font-black text-teal-200">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p></li>)}</ol></div>
      </section>

      <section aria-labelledby="next-title" className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,.85fr)]">
        <div><h2 className="text-3xl font-black" id="next-title">Khi nào nên chuyển sang nhiều bài liên tiếp?</h2><p className="mt-4 leading-8 text-slate-700">Một bài nói giúp bạn kiểm tra quy trình. Khi trả lời được cả ba câu, chỉ ra đúng bằng chứng và nghe lại không cần transcript, hãy luyện nhiều nhóm liên tiếp để kiểm tra khả năng chuyển nhanh giữa các loại bài.</p><p className="mt-4 leading-8 text-slate-700">Bài thử Listening công khai hiện dùng các nhóm Part 3 và hiển thị kết quả ngay sau khi nộp. Bạn có thể dùng nó để luyện sức tập trung trước khi vào một bài Listening dài hơn; kết quả là độ chính xác luyện tập, không phải điểm TOEIC quy đổi.</p><Link className={`mt-5 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-black text-white hover:bg-teal-900 ${focusClass}`} href="/try#quick-practice">Làm bài Listening ngắn <span className="ml-3" aria-hidden="true">→</span></Link></div>
        <aside className="h-fit rounded-2xl border border-teal-200 bg-white p-6"><h2 className="text-xl font-black">Học tiếp theo lỗi</h2><ul className="mt-4 space-y-4 text-sm leading-6 text-slate-700"><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/blog/cach-luyen-nghe-toeic-part-3-4">Quy trình luyện Part 3–4</Link><span className="mt-1 block">Cách nghe lại, shadowing và dùng transcript có giới hạn.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/blog/toeic-part-4-cau-hoi-bang-bieu">Part 4 có bảng biểu</Link><span className="mt-1 block">Tìm ô neo và nối dữ liệu nhìn thấy với audio.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/part-3">Quay lại Part 3</Link><span className="mt-1 block">Luyện theo dõi nhiều người nói và thay đổi qua lượt lời.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/listening">Bản đồ Listening Part 1–4</Link><span className="mt-1 block">Chọn Part theo kiểu lỗi đang gặp.</span></li></ul></aside>
      </section>

      <p className="mt-12 text-sm leading-6 text-slate-600">Cấu trúc và số câu được đối chiếu với <a className={`font-bold text-teal-800 underline underline-offset-4 ${focusClass}`} href="https://www.ets.org/toeic/about/listening-reading.html" rel="noopener noreferrer" target="_blank">mô tả TOEIC Listening &amp; Reading của ETS</a>. Audio, transcript, câu hỏi và lời giải mẫu do TOEIC GYM tự biên soạn; TOEIC GYM không liên kết hoặc được ETS bảo trợ.</p>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
