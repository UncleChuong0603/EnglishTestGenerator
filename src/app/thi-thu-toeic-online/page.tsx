import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { getCurrentUser } from "@/lib/auth/session";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata = publicPageMetadata({
  title: "Thi thử TOEIC online: chọn bài ngắn, Reading hoặc Full Mock",
  description: "Tìm bài thi thử TOEIC phù hợp: bài thử ngắn không cần tài khoản, Reading 100 câu hoặc Full Mock 200 câu khi kho đề đã sẵn sàng. Xem rõ thời gian và điều kiện.",
  canonical: "/thi-thu-toeic-online",
});

const modes = [
  { title: "Bài thử ngắn", detail: "Listening khoảng 9 câu hoặc Reading 10–15 câu", time: "Khoảng 7–10 phút", access: "Không cần tài khoản", href: "/try#quick-practice", label: "Làm bài thử miễn phí" },
  { title: "Reading 100 câu", detail: "Part 5–7, làm trọn phần Reading", time: "75 phút", access: "Cần tài khoản; mở khi bộ câu hỏi sẵn sàng", href: "/full-mock", label: "Xem trạng thái thi thử" },
  { title: "Listening 100 câu hoặc Full Mock 200 câu", detail: "Part 1–4 hoặc cả Listening và Reading", time: "45 phút hoặc 120 phút", access: "Cần tài khoản; mỗi mode chỉ mở khi bộ câu hỏi sẵn sàng", href: "/full-mock", label: "Xem trạng thái thi thử" },
] as const;

export default async function Page() {
  const user = await getCurrentUser();
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900"><PublicHeader locale="vi" signedIn={Boolean(user)} />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: "Thi thử online", path: "/thi-thu-toeic-online" }]} />
      <header className="mt-8 border-b border-slate-300 pb-10"><p className="text-sm font-bold uppercase tracking-[.16em] text-teal-800">TOEIC Listening & Reading</p><h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Thi thử TOEIC online: chọn đúng độ dài bài</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">Nếu mới bắt đầu, hãy dùng bài thử ngắn để tìm Part cần luyện. Bài Reading hoặc Full Mock có đồng hồ và số câu nhiều hơn, phù hợp khi bạn muốn kiểm tra sức bền. Tình trạng mở bài dài phụ thuộc vào kho câu hỏi đã được kiểm tra.</p><Link className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-bold text-white" href="/try#quick-practice">Làm bài thử ngắn miễn phí <span className="ml-3" aria-hidden="true">→</span></Link></header>
      <section className="mt-12"><h2 className="text-2xl font-black">Ba cách bắt đầu</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{modes.map(mode => <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6" key={mode.title}><h3 className="text-xl font-black">{mode.title}</h3><p className="mt-3 leading-7 text-slate-700">{mode.detail}</p><p className="mt-4 font-bold text-teal-800">{mode.time}</p><p className="mt-2 text-sm leading-6 text-slate-600">{mode.access}</p><Link className="mt-auto inline-flex min-h-11 items-center pt-6 font-bold text-teal-800 underline" href={mode.href}>{mode.label} →</Link></article>)}</div></section>
      <section className="mt-14 grid gap-10 border-t border-slate-300 pt-10 md:grid-cols-2"><div><h2 className="text-2xl font-black">Làm bài nào trước?</h2><p className="mt-4 leading-8 text-slate-700">Chưa biết điểm yếu: làm bài thử Listening hoặc Reading ngắn. Đang ôn tốc độ đọc: chọn Reading 100 câu khi mode này sẵn sàng. Sắp thi và muốn tập phân bổ sức: chọn Full Mock 200 câu khi được mở. Đừng dùng kết quả một bài ngắn để quy đổi thành điểm TOEIC chính thức.</p></div><div><h2 className="text-2xl font-black">Sau khi nộp bài</h2><p className="mt-4 leading-8 text-slate-700">Xem độ chính xác và câu sai theo Part. Chọn một lỗi lặp lại để học lại bằng bài ngắn; ví dụ <Link className="font-bold text-teal-800 underline" href="/toeic/part-5/practice">Part 5 có giải thích</Link> hoặc <Link className="font-bold text-teal-800 underline" href="/toeic/listening">bài mẫu Listening Part 1–4</Link>. Thi thử chỉ hữu ích khi kết quả dẫn đến buổi sửa lỗi cụ thể.</p></div></section>
      <p className="mt-12 text-sm text-slate-600">Thời lượng và cấu trúc bài thi tham chiếu <a className="underline" href="https://www.ets.org/toeic/about/listening-reading.html" rel="noopener noreferrer" target="_blank">mô tả TOEIC Listening & Reading của ETS</a>. TOEIC GYM không liên kết hoặc được ETS bảo trợ. Kết quả luyện tập là độ chính xác thô, không phải điểm TOEIC chính thức hay điểm dự đoán.</p>
    </article><PublicFooter locale="vi" /></main>;
}
