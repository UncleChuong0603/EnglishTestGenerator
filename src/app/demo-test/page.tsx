import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LearnerNav } from "@/components/learner-nav";
import { getActiveDemoTest } from "@/lib/demo-test/queries";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
import { startDemoTest } from "./actions";

export const metadata: Metadata = { title: "Thi thử TOEIC Reading", robots: { index: false, follow: false } };

export default async function DemoTestIntroduction({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  if (!user) redirect("/sign-in");
  const [preferences, active] = await Promise.all([getPreferences(user.id), getActiveDemoTest(user.id)]);
  const t = getTranslations(preferences.interfaceLanguage);
  const vi = preferences.interfaceLanguage === "vi";
  const error = params.error === "database_update_required" ? t.demoTest.migrationError : params.error ? t.demoTest.contentError : null;
  const parts = [[5, 30, t.parts.title5], [6, 16, t.parts.title6], [7, 54, t.parts.title7]] as const;
  return <main className="min-h-screen bg-slate-50 px-4 py-6 pb-24 text-slate-900 sm:px-6 sm:py-8 lg:pb-8"><div className="mx-auto max-w-5xl"><LearnerNav locale={preferences.interfaceLanguage} />
    <Link className="mt-6 inline-flex min-h-11 items-center font-bold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-teal-700" href="/full-mock">← {vi ? "Thi thử" : "Mock Tests"}</Link>
    <section className="mt-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="reading-title">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-2xl"><h1 className="text-3xl font-black tracking-tight sm:text-4xl" id="reading-title">{t.demoTest.title}</h1><ul className="mt-4 flex flex-wrap gap-2 text-sm font-bold">{[t.demoTest.questions, t.demoTest.duration, vi ? "Part 5–7" : "Parts 5–7"].map(value => <li className="rounded-full bg-slate-100 px-3 py-1.5" key={value}>{value}</li>)}</ul><p className="mt-4 leading-7 text-slate-600">{vi ? "Làm trọn phần Reading trong điều kiện có giới hạn thời gian." : "Practice a complete TOEIC-style Reading section under timed conditions."}</p>{active ? <p className="mt-4 font-bold text-teal-800">{t.demoTest.resumeBody}</p> : null}</div>
      <div className="w-full shrink-0 lg:w-64">{active ? <Link className="flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-center font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2" href={`/demo-test/${active.id}`}>{t.demoTest.resume}</Link> : <form action={startDemoTest}><button className="min-h-12 w-full rounded-xl bg-teal-700 px-5 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2" type="submit">{t.demoTest.start}</button></form>}</div></div>
    </section>
    {error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</p> : null}
    <section className="mt-8" aria-labelledby="parts-title"><h2 className="text-xl font-black" id="parts-title">{vi ? "Cấu trúc bài thi" : "Section breakdown"}</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{parts.map(([part, count, title]) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={part}><h3 className="font-black text-teal-800">Part {part}</h3><p className="mt-1 font-semibold">{title}</p><p className="mt-2 text-sm text-slate-600">{count} {vi ? "câu hỏi" : "questions"}</p></article>)}</div></section>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="conditions-title"><h2 className="text-xl font-black" id="conditions-title">{vi ? "Điều kiện làm bài" : "Test conditions"}</h2><ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-6 text-slate-700"><li>{vi ? "Đồng hồ 75 phút chạy liên tục." : "The 75-minute timer runs continuously."}</li><li>{vi ? "Câu trả lời được tự động lưu." : "Answers save automatically."}</li><li>{vi ? "Đáp án chỉ hiện sau khi nộp bài." : "Answers appear after submission."}</li></ul><p className="mt-4 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">{t.demoTest.disclaimer}</p></section>
  </div></main>;
}
