import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { startPart5Challenge } from "../actions";

export const metadata: Metadata = {
  title: "Thử thách TOEIC Part 5: 10 câu miễn phí | TOEIC GYM",
  description: "Làm 10 câu TOEIC Part 5 miễn phí, không cần đăng nhập. Xem độ chính xác, nhóm kỹ năng và giải thích sau khi nộp bài.",
  alternates: { canonical: "/challenge/part-5" },
};

export default async function Part5ChallengePage({ searchParams }: PageProps<"/challenge/part-5">) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  const vi = locale === "vi";
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-20">
      <Link className="text-sm font-bold text-teal-800 underline underline-offset-4" href="/challenge">← Challenge</Link>
      <p className="mt-8 text-sm font-black uppercase tracking-[.18em] text-teal-800">TOEIC GYM / PART 5 CHALLENGE</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">{vi ? "Bạn làm đúng bao nhiêu trong 10 câu Part 5?" : "How many of 10 Part 5 questions can you answer?"}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{vi ? "10 câu hoàn thành câu về ngữ pháp và từ vựng. Làm bài trước, xem kết quả thật và giải thích đầy đủ sau khi nộp." : "Answer 10 grammar and vocabulary questions. See your real result and full explanations after submission."}</p>
      <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-slate-700"><span className="rounded-full bg-white px-4 py-2">10 {vi ? "câu" : "questions"}</span><span className="rounded-full bg-white px-4 py-2">{vi ? "Không cần tài khoản" : "No account needed"}</span><span className="rounded-full bg-white px-4 py-2">{vi ? "Xem lời giải sau khi nộp" : "Explanations after submission"}</span></div>
      {query.error ? <p className="mt-6 max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{query.error === "limit" ? (vi ? "Bạn đã dùng hết lượt tạo bài hôm nay. Hãy quay lại khi lượt được đặt lại." : "You have used today's session allowance. Please return after it resets.") : (vi ? "Chưa thể tạo thử thách đủ 10 câu. Vui lòng thử lại sau." : "Could not prepare a full 10-question challenge. Please try again later.")}</p> : null}
      <form action={startPart5Challenge} className="mt-9"><button className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-teal-700 px-8 text-lg font-black text-white shadow-lg shadow-teal-900/10 sm:w-auto" type="submit">{vi ? "Bắt đầu ngay" : "Start now"} <span aria-hidden="true" className="ml-3">→</span></button></form>
      <p className="mt-4 text-sm text-slate-500">{vi ? "Kết quả là độ chính xác của 10 câu, không phải điểm TOEIC dự đoán." : "Your result is accuracy across 10 questions, not a predicted TOEIC score."}</p>
    </section>
    <PublicFooter locale={locale} />
  </main>;
}
