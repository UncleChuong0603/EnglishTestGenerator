import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getWordFormQuestions } from "@/lib/seo/word-form";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { WordFormQuiz } from "./word-form-quiz";

export const metadata = publicPageMetadata({
  title: "Bài tập Word Form TOEIC Part 5 có đáp án",
  description: "Học cách chọn đúng loại từ trong TOEIC Part 5 và làm thử 5 câu Word Form miễn phí, có giải thích cho từng đáp án.",
  canonical: "/toeic/part-5/word-form",
});

export default async function Page() {
  const [user, questions] = await Promise.all([getCurrentUser(), getWordFormQuestions()]);
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900"><PublicHeader locale="vi" signedIn={Boolean(user)} />
    <article className="mx-auto max-w-4xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: "Part 5", path: "/toeic/part-5" }, { name: "Word Form", path: "/toeic/part-5/word-form" }]} />
      <header className="mt-8 border-b border-slate-300 pb-9"><p className="text-sm font-bold uppercase tracking-[.16em] text-teal-800">TOEIC Reading · Part 5</p><h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">Bài tập Word Form TOEIC Part 5</h1><p className="mt-6 text-lg leading-8 text-slate-700">Word Form là dạng chọn từ có đúng vai trò ngữ pháp trong câu. Nhìn vị trí chỗ trống, thử 5 câu từ ngân hàng câu hỏi rồi đọc lời giải sau khi nộp.</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-5 font-bold text-white" href="#quiz">Làm 5 câu ngay ↓</Link></header>
      <section className="mt-9 space-y-4 leading-8 text-slate-700"><h2 className="text-2xl font-black text-slate-900">Nhận biết loại từ cần điền</h2><p>Đọc hai bên chỗ trống trước khi xem đáp án. Sau mạo từ hoặc tính từ thường cần <strong>danh từ</strong> (a detailed <em>report</em>). Sau “to” chỉ mục đích thường cần <strong>động từ</strong> nguyên mẫu (to <em>review</em> the report). Trước danh từ thường cần <strong>tính từ</strong> (a <em>clear</em> report). Khi bổ nghĩa cho động từ hoặc tính từ, thường cần <strong>trạng từ</strong> (respond <em>quickly</em>).</p><p>Đọc lại cả câu để kiểm tra nghĩa. Đừng đoán chỉ bằng đuôi từ: <em>friendly</em> kết thúc bằng “-ly” nhưng là tính từ. Một lỗi khác là chọn đúng nghĩa nhưng sai loại từ, như dùng <em>quick</em> thay cho <em>quickly</em> để bổ nghĩa cho động từ.</p></section>
      <div className="mt-9"><WordFormQuiz questions={questions} /></div>
      <section className="mt-10 space-y-4 leading-8 text-slate-700"><h2 className="text-2xl font-black text-slate-900">Luyện tiếp sau khi xem lời giải</h2><p>Với câu sai, chỉ ra từ đứng cạnh chỗ trống và loại từ cần dùng. Sau đó thử một nhóm câu Part 5 trộn nhiều kỹ năng để kiểm tra bạn có nhận ra dấu hiệu khi không biết trước chủ đề.</p><div className="flex flex-wrap gap-3"><Link className="inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-5 font-bold text-white" href="/challenge/part-5">Làm Part 5 Challenge</Link><Link className="inline-flex min-h-12 items-center rounded-lg border border-teal-800 px-5 font-bold text-teal-900" href="/toeic/part-5">Xem cách luyện Part 5</Link></div></section>
    </article><PublicFooter locale="vi" /></main>;
}
