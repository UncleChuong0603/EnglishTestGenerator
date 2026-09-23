import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";

export const metadata: Metadata = {
  title: "TOEIC Challenge miễn phí | TOEIC GYM",
  description: "Thử thách TOEIC Part 5 gồm 10 câu miễn phí. Làm ngay không cần tài khoản và xem đáp án cùng giải thích sau khi nộp.",
  alternates: { canonical: "/challenge" },
};

export default async function ChallengePage() {
  const user = await getCurrentUser();
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  const vi = locale === "vi";
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-20">
      <p className="text-sm font-black uppercase tracking-[.18em] text-teal-800">TOEIC GYM / CHALLENGE</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">{vi ? "Thử sức với TOEIC trong 10 câu" : "Test yourself with 10 TOEIC questions"}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{vi ? "Làm một thử thách ngắn, xem số câu đúng và lời giải cho từng câu sai. Không cần đăng nhập để bắt đầu." : "Take a short challenge, see your correct answers and review every mistake. No sign-in needed to start."}</p>
      <div className="mt-9 rounded-3xl border border-teal-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-wider text-teal-700">{vi ? "Thử thách đầu tiên" : "First challenge"}</p>
        <h2 className="mt-2 text-2xl font-black">TOEIC Part 5</h2>
        <p className="mt-3 text-slate-600">{vi ? "10 câu hoàn thành câu · Ngữ pháp và từ vựng · Xem kết quả ngay sau khi nộp." : "10 sentence-completion questions · Grammar and vocabulary · Instant result after submission."}</p>
        <Link className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-6 font-bold text-white" href="/challenge/part-5">{vi ? "Khám phá thử thách" : "Explore the challenge"}</Link>
      </div>
    </section>
    <PublicFooter locale={locale} />
  </main>;
}
