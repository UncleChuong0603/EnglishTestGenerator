import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { getCurrentUser } from "@/lib/auth/session";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata = publicPageMetadata({
  title: "Luyện nghe TOEIC online theo Part 1–4: audio và lời giải",
  description: "Chọn kỹ năng nghe TOEIC Part 1, 2, 3 hoặc 4. Nghe bài mẫu tự biên soạn, xem transcript, đáp án và cách sửa lỗi trước khi luyện dài hơn.",
  canonical: "/toeic/listening",
});

const parts = [
  { number: 1, title: "Mô tả tranh", task: "Quan sát chủ thể và hành động, rồi nghe bốn câu mô tả.", sample: "Ảnh gốc + 1 câu audio có giải thích" },
  { number: 2, title: "Hỏi đáp", task: "Nhận diện ý câu hỏi và chọn một phản hồi phù hợp.", sample: "1 câu hỏi + 3 lời đáp có transcript" },
  { number: 3, title: "Hội thoại", task: "Theo dõi cuộc trao đổi và tìm bằng chứng cho từng câu hỏi.", sample: "Hội thoại + 3 câu có lời giải" },
  { number: 4, title: "Bài nói ngắn", task: "Nghe thông báo, tách mục đích, chi tiết và hành động.", sample: "Thông báo + 3 câu có transcript" },
] as const;

export default async function Page() {
  const user = await getCurrentUser();
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900"><PublicHeader locale="vi" signedIn={Boolean(user)} />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: "Luyện nghe", path: "/toeic/listening" }]} />
      <header className="mt-8 border-b border-slate-300 pb-10"><p className="text-sm font-bold uppercase tracking-[.16em] text-teal-800">TOEIC Listening · Part 1–4</p><h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Luyện nghe TOEIC online theo từng Part</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">Nghe thử một bài đúng dạng đang cần luyện, tự chọn đáp án rồi dùng transcript để tìm lý do sai. Bốn bài mẫu bên dưới dùng audio và câu hỏi do TOEIC GYM tạo riêng, mở được không cần tài khoản.</p><Link className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-bold text-white" href="#chon-part">Chọn Part để nghe <span className="ml-3" aria-hidden="true">↓</span></Link></header>
      <section className="mt-12" id="chon-part"><h2 className="text-2xl font-black">Chọn dạng nghe bạn muốn cải thiện</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{parts.map(part => <article className="rounded-2xl border border-slate-200 bg-white p-6" key={part.number}><p className="text-sm font-black uppercase tracking-wider text-teal-800">Part {part.number}</p><h3 className="mt-2 text-xl font-black">{part.title}</h3><p className="mt-3 leading-7 text-slate-700">{part.task}</p><p className="mt-3 text-sm text-slate-600">Bài mẫu: {part.sample}</p><Link className="mt-5 inline-flex min-h-11 items-center font-bold text-teal-800 underline" href={`/toeic/part-${part.number}`}>Nghe bài mẫu Part {part.number} →</Link></article>)}</div></section>
      <section className="mt-14 grid gap-8 border-t border-slate-300 pt-10 md:grid-cols-2"><div><h2 className="text-2xl font-black">Một vòng luyện nghe có mục tiêu</h2><ol className="mt-4 list-decimal space-y-3 pl-6 leading-8 text-slate-700"><li>Chọn một Part và đọc câu hỏi trước khi phát audio nếu dạng bài cho phép.</li><li>Nghe một lượt, chọn đáp án theo ý và chi tiết bạn thực sự nghe được.</li><li>Xem lời giải, nghe lại rồi mới mở transcript để xác nhận bằng chứng.</li><li>Ghi lỗi của mình: bỏ lỡ âm, hiểu sai ý, hay nhầm mốc thời gian.</li></ol></div><div><h2 className="text-2xl font-black">Khi nào nên chuyển sang bài dài?</h2><p className="mt-4 leading-8 text-slate-700">Bài mẫu chỉ giúp kiểm tra một thao tác nghe. Khi bạn giải thích được đáp án bằng chứng trong audio, hãy thử bài Listening ngắn trong TOEIC GYM. Bài thử công khai hiện dùng nhóm câu Part 3; nội dung từng Part trong phần luyện có thể phụ thuộc kho câu hỏi đang sẵn sàng.</p><Link className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-bold text-white" href="/try#quick-practice">Thử Listening miễn phí</Link></div></section>
      <p className="mt-12 text-sm text-slate-600">TOEIC GYM là nền tảng độc lập, không liên kết với ETS. Bài mẫu không dự đoán điểm TOEIC chính thức.</p>
    </article><PublicFooter locale="vi" /></main>;
}
