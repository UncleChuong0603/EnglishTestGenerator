import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/auth/session";
import { WordFormQuiz } from "./word-form-quiz";

export const metadata: Metadata = {
  title: "Bài tập Word Form TOEIC Part 5 có đáp án",
  description: "Học cách chọn đúng loại từ trong TOEIC Part 5 và làm thử 5 câu Word Form miễn phí, có giải thích cho từng đáp án.",
  alternates: { canonical: "/toeic/part-5/word-form" },
};

export default async function Page() {
  const user = await getCurrentUser();
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900"><PublicHeader locale="vi" signedIn={Boolean(user)} />
    <article className="mx-auto max-w-4xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600"><Link className="underline" href="/">Trang chủ</Link> / <Link className="underline" href="/toeic/part-5">Part 5</Link> / Word Form</nav>
      <header className="mt-8 border-b border-slate-300 pb-9"><p className="text-sm font-bold uppercase tracking-[.16em] text-teal-800">TOEIC Reading · Part 5</p><h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">Bài tập Word Form TOEIC Part 5</h1><p className="mt-6 text-lg leading-8 text-slate-700">Word Form là dạng chọn đúng loại từ cho một vị trí trong câu. Thử quy tắc trên câu cụ thể, rồi kiểm tra đáp án và lý do chọn.</p></header>
      <section className="mt-10 space-y-4 leading-8 text-slate-700"><h2 className="text-2xl font-black text-slate-900">Nhận diện loại từ trong ba bước</h2><p>Trước tiên, tìm động từ chính và các cụm danh từ để hiểu cấu trúc câu. Tiếp theo, nhìn hai bên chỗ trống: trước danh từ thường cần tính từ; sau mạo từ có thể cần danh từ; vị trí bổ nghĩa cho động từ thường cần trạng từ. Cuối cùng, đọc lại toàn câu để kiểm tra nghĩa.</p><p>Đừng chọn chỉ vì đuôi từ quen thuộc. Ví dụ, đuôi <em>-ly</em> thường báo hiệu trạng từ nhưng friendly lại là tính từ. Vai trò của từ trong câu luôn quan trọng hơn mẹo nhận diện bằng đuôi.</p><ul className="list-disc space-y-2 pl-6"><li><strong>Tính từ:</strong> a clear explanation, a prompt reply.</li><li><strong>Trạng từ:</strong> respond promptly, explain clearly.</li><li><strong>Danh từ:</strong> provide an explanation, conduct an analysis.</li></ul></section>
      <div className="mt-10"><WordFormQuiz /></div>
      <section className="mt-10 space-y-4 leading-8 text-slate-700"><h2 className="text-2xl font-black text-slate-900">Sau khi làm bài, nên luyện gì tiếp?</h2><p>Với câu sai, hãy chỉ ra chỗ trống cần loại từ nào và từ nào trong câu là dấu hiệu. Nếu sai nhiều ở dạng tính từ và trạng từ, làm thêm nhóm câu cùng dạng trước khi trộn với thì, giới từ và từ vựng. Sau một đến ba ngày, thử câu mới để kiểm tra xem bạn còn nhận ra quy tắc hay không.</p><p>Các câu ví dụ trên được viết riêng cho trang hướng dẫn này. Bài luyện trong TOEIC GYM có thể có nội dung khác tùy ngân hàng câu hỏi đang sẵn sàng.</p><div className="flex flex-wrap gap-3"><Link className="inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-5 font-bold text-white" href="/try#quick-practice">Thử bài Reading miễn phí</Link><Link className="inline-flex min-h-12 items-center rounded-lg border border-teal-800 px-5 font-bold text-teal-900" href="/toeic/part-5">Xem hướng dẫn Part 5</Link></div></section>
    </article><PublicFooter locale="vi" /></main>;
}
