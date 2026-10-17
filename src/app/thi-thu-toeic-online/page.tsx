import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { MOCK_TEST_HUB_MODES, mockTestHubStructuredData } from "@/lib/seo/mock-test-hub";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { serializeStructuredData } from "@/lib/seo/structured-data";

export const metadata = publicPageMetadata({
  title: "Thi thử TOEIC online: bài ngắn đến Full Mock 200 câu",
  description: "So sánh bài thử TOEIC miễn phí, Listening 100 câu, Reading 100 câu và Full Mock 200 câu; xem thời gian, tài khoản, kết quả và cách sửa lỗi.",
  canonical: "/thi-thu-toeic-online",
});

const decisionRoutes = [
  {
    label: "Chưa biết Part nào yếu",
    answer: "Làm đánh giá đầu vào 15–25 phút để nhận kết quả theo Part và một bài luyện tiếp theo.",
    href: "/diagnostic",
    cta: "Bắt đầu đánh giá",
  },
  {
    label: "Chỉ có khoảng 10 phút",
    answer: "Chọn bài thử nhanh Listening hoặc Reading. Mục tiêu là tìm một lỗi cụ thể, không phải đo sức bền.",
    href: "/try#quick-practice",
    cta: "Chọn bài nhanh",
  },
  {
    label: "Đang hụt giờ ở Part 7",
    answer: "Chọn Reading Mock 75 phút để quan sát nhịp làm Part 5–7 và số câu còn lại khi gần hết giờ.",
    href: "/full-mock#full-tests",
    cta: "Xem Reading Mock",
  },
  {
    label: "Sắp thi và đã quen từng kỹ năng",
    answer: "Chọn Full Mock 120 phút để tập chuyển từ Listening sang Reading và giữ tập trung đến cuối bài.",
    href: "/full-mock#full-tests",
    cta: "Xem Full Mock",
  },
] as const;

const reviewSteps = [
  ["Ghi kết quả thô", "Lưu số câu đúng/tổng câu và độ chính xác theo Part; không tự đổi bài luyện thành điểm TOEIC."],
  ["Tách nguyên nhân sai", "Đánh dấu mỗi câu sai là thiếu kiến thức, bỏ sót bằng chứng hay thiếu thời gian."],
  ["Chọn một lỗi lặp lại", "Ưu tiên kiểu lỗi xuất hiện nhiều lần, thay vì học lại đồng thời mọi Part."],
  ["Luyện lại trong 48 giờ", "Làm một nhóm 10–20 câu đúng trọng tâm, rồi so sánh lỗi cũ có còn lặp lại không."],
] as const;

const focusClass = "outline-offset-4 focus-visible:outline-3 focus-visible:outline-teal-800";

export default async function Page() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCookieLanguage()]);
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(mockTestHubStructuredData()) }} type="application/ld+json" />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: locale === "vi" ? "Trang chủ" : "Home", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: locale === "vi" ? "Thi thử online" : "Online mock tests", path: "/thi-thu-toeic-online" }]} />

      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-black uppercase tracking-[.16em] text-teal-800">TOEIC Listening &amp; Reading</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Thi thử TOEIC online: chọn bài đúng mục tiêu</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">Không phải lúc nào cũng cần bắt đầu bằng 200 câu. Hãy chọn bài theo câu hỏi bạn muốn trả lời hôm nay: Part nào đang yếu, tốc độ Reading có đủ hay bạn đã sẵn sàng cho 120 phút liên tục.</p>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">Bài thử nhanh mở không cần tài khoản. Listening Mock, Reading Mock và Full Mock cần đăng nhập; từng chế độ chỉ bắt đầu được khi bộ câu hỏi đã sẵn sàng.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link className={`inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-800 px-6 font-black text-white hover:bg-teal-900 ${focusClass}`} href="/try#quick-practice">Làm bài thử miễn phí <span className="ml-3" aria-hidden="true">→</span></Link>
          <Link className={`inline-flex min-h-12 items-center justify-center rounded-lg border border-teal-800 px-6 font-black text-teal-900 hover:bg-white ${focusClass}`} href="#chon-bai-thi">So sánh các chế độ <span className="ml-3" aria-hidden="true">↓</span></Link>
        </div>
      </header>

      <section aria-labelledby="mode-title" className="scroll-mt-24 pt-12" id="chon-bai-thi">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Từ 7 đến 120 phút</p>
          <h2 className="mt-2 text-3xl font-black" id="mode-title">So sánh 4 chế độ trước khi bắt đầu</h2>
          <p className="mt-4 leading-8 text-slate-700">Chọn bài ngắn nhất vẫn trả lời được mục tiêu của bạn. Một bài 10 phút đúng trọng tâm có ích hơn Full Mock nếu bạn chưa biết sẽ làm gì với kết quả.</p>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {MOCK_TEST_HUB_MODES.map((mode) => <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6" key={mode.id}>
            <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-xl font-black">{mode.title}</h3><span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-black text-teal-900">{mode.time}</span></div>
            <p className="mt-3 font-bold text-slate-900">{mode.scope}</p>
            <dl className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
              <div><dt className="font-black text-slate-900">Truy cập</dt><dd className="mt-1">{mode.access}</dd></div>
              <div><dt className="font-black text-slate-900">Dùng khi</dt><dd className="mt-1">{mode.bestFor}</dd></div>
              <div><dt className="font-black text-slate-900">Sau khi nộp</dt><dd className="mt-1">{mode.result}</dd></div>
            </dl>
            <Link className={`mt-auto inline-flex min-h-11 items-center pt-6 font-black text-teal-800 underline decoration-2 underline-offset-4 hover:text-teal-950 ${focusClass}`} href={mode.href}>{mode.cta} <span className="ml-2" aria-hidden="true">→</span></Link>
          </article>)}
        </div>
      </section>

      <section aria-labelledby="decision-title" className="mt-14 border-t border-slate-300 pt-10">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Chọn trong 30 giây</p><h2 className="mt-2 text-3xl font-black" id="decision-title">Bắt đầu từ tình huống gần bạn nhất</h2></div>
        <div className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-slate-300 bg-slate-300 sm:grid-cols-2">
          {decisionRoutes.map((route) => <article className="flex flex-col bg-white p-6" key={route.label}><h3 className="text-lg font-black">{route.label}</h3><p className="mt-3 leading-7 text-slate-700">{route.answer}</p><Link className={`mt-auto inline-flex min-h-11 items-center pt-5 font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href={route.href}>{route.cta} <span className="ml-2" aria-hidden="true">→</span></Link></article>)}
        </div>
      </section>

      <section aria-labelledby="ready-title" className="mt-14 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-12">
          <div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-300">Trước khi bấm bắt đầu</p><h2 className="mt-2 text-3xl font-black" id="ready-title">Chuẩn bị để kết quả có ý nghĩa</h2><p className="mt-4 leading-7 text-slate-300">Một bài mock chỉ đáng tin khi điều kiện làm bài đủ ổn định để lỗi phản ánh năng lực, không phải tiếng ồn hoặc việc bị ngắt quãng.</p></div>
          <ul className="grid gap-5 sm:grid-cols-2">
            <li className="border-l-2 border-teal-400 pl-4"><strong className="block">Giữ trọn khung thời gian</strong><span className="mt-1 block text-sm leading-6 text-slate-300">Dành 45, 75 hoặc 120 phút không bị gián đoạn cho bài dài.</span></li>
            <li className="border-l-2 border-teal-400 pl-4"><strong className="block">Kiểm tra audio trước</strong><span className="mt-1 block text-sm leading-6 text-slate-300">Dùng tai nghe hoặc loa rõ nếu chọn Listening; xử lý âm lượng trước khi tính giờ.</span></li>
            <li className="border-l-2 border-teal-400 pl-4"><strong className="block">Không tra cứu giữa bài</strong><span className="mt-1 block text-sm leading-6 text-slate-300">Đánh dấu câu đoán và tiếp tục để nhìn đúng giới hạn hiện tại.</span></li>
            <li className="border-l-2 border-teal-400 pl-4"><strong className="block">Xác định dữ liệu cần ghi</strong><span className="mt-1 block text-sm leading-6 text-slate-300">Theo dõi câu đúng, câu bỏ trống và Part làm chậm; không chỉ nhìn tổng.</span></li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="review-title" className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(16rem,.8fr)]">
        <div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">20 phút sau khi nộp</p><h2 className="mt-2 text-3xl font-black" id="review-title">Biến kết quả thành buổi luyện tiếp theo</h2><ol className="mt-6 space-y-5">{reviewSteps.map(([title, detail], index) => <li className="grid grid-cols-[2.5rem_1fr] gap-4" key={title}><span className="flex size-10 items-center justify-center rounded-full bg-teal-800 font-black text-white" aria-hidden="true">{index + 1}</span><div><h3 className="font-black">{title}</h3><p className="mt-1 leading-7 text-slate-700">{detail}</p></div></li>)}</ol></div>
        <aside className="h-fit rounded-2xl border border-teal-200 bg-white p-6"><h2 className="text-xl font-black">Đi tiếp theo lỗi nổi bật</h2><ul className="mt-4 space-y-4 text-sm leading-6 text-slate-700"><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/listening">Luyện Listening Part 1–4</Link><span className="mt-1 block">Chọn Part theo lỗi nghe và dùng transcript để tìm bằng chứng.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/part-5/practice">Luyện Part 5 có giải thích</Link><span className="mt-1 block">Sửa lỗi ngữ pháp hoặc từ vựng lặp lại trong câu.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/thang-diem">Hiểu đúng thang điểm TOEIC</Link><span className="mt-1 block">Phân biệt độ chính xác bài luyện với scaled score chính thức.</span></li></ul></aside>
      </section>

      <section aria-labelledby="answer-title" className="mt-14 border-t border-slate-300 pt-10"><h2 className="text-3xl font-black" id="answer-title">Ba điều cần biết trước khi thi thử</h2><div className="mt-6 grid gap-6 md:grid-cols-3"><article><h3 className="text-lg font-black">Có bài miễn phí không?</h3><p className="mt-3 leading-7 text-slate-700">Có. Bài thử nhanh Listening hoặc Reading mở không cần tài khoản. Bài dài yêu cầu đăng nhập để lưu tiến độ và kết quả.</p></article><article><h3 className="text-lg font-black">Kết quả có phải điểm TOEIC?</h3><p className="mt-3 leading-7 text-slate-700">Không. TOEIC GYM hiển thị số câu đúng và độ chính xác luyện tập; không quy đổi thành điểm chính thức hoặc điểm dự đoán.</p></article><article><h3 className="text-lg font-black">Vì sao một chế độ chưa mở?</h3><p className="mt-3 leading-7 text-slate-700">Mỗi Listening, Reading hoặc Full Mock chỉ mở khi bộ câu hỏi tương ứng đã đủ và được kiểm tra. Trang kho đề hiển thị trạng thái hiện tại.</p></article></div></section>

      <p className="mt-12 text-sm leading-6 text-slate-600">Cấu trúc và thời lượng được đối chiếu với <a className={`font-bold text-teal-800 underline underline-offset-4 ${focusClass}`} href="https://www.ets.org/toeic/about/listening-reading.html" rel="noopener noreferrer" target="_blank">mô tả TOEIC Listening &amp; Reading của ETS</a>. TOEIC GYM là nền tảng độc lập, không liên kết hoặc được ETS bảo trợ; toàn bộ câu hỏi luyện tập là nội dung TOEIC-style, không phải đề thi chính thức.</p>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
