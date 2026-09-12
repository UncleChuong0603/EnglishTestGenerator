import Link from "next/link";
import { redirect } from "next/navigation";

import { PerformanceList } from "@/components/analytics/performance-list";
import { LearnerNav } from "@/components/learner-nav";
import { getLearnerAnalytics } from "@/lib/analytics/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  let analytics;
  try {
    analytics = await getLearnerAnalytics(user.id);
  } catch (error) {
    console.error("Could not load progress page", error);
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl"><LearnerNav /><section className="mt-10 rounded-2xl border border-red-100 bg-white p-8 text-center"><h1 className="text-2xl font-black">We couldn&apos;t load your progress</h1><p className="mt-2 text-slate-600">Please try again in a moment.</p><Link className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" href="/progress">Try again</Link></section></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <LearnerNav />
        <header className="mt-10">
          <p className="text-sm font-bold uppercase tracking-wider text-teal-700">Your progress</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">TOEIC Part 5 progress</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">Accuracy is calculated from every answer in your completed practice sessions.</p>
        </header>

        {analytics.totalAttempted === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
            <h2 className="text-2xl font-black">Complete your first practice</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">We need a little practice data before we can show your strengths and areas to improve.</p>
            <Link className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" href="/practice/part-5">Start practice</Link>
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl bg-slate-900 p-6 text-white"><p className="text-sm text-slate-300">Overall accuracy</p><p className="mt-2 text-4xl font-black">{analytics.overallAccuracy}%</p></article>
              <article className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-500">Questions answered</p><p className="mt-2 text-4xl font-black">{analytics.totalAttempted}</p></article>
              <article className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-500">Practice sessions</p><p className="mt-2 text-4xl font-black">{analytics.sessionCount}</p></article>
            </section>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="mb-6 text-xl font-black">Skills</h2><PerformanceList metrics={analytics.skills} /></section>
              <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Subskills</h2><p className="mb-6 mt-2 text-sm text-slate-500">A classification appears after at least 5 answers in a subskill.</p><PerformanceList metrics={analytics.subskills} /></section>
            </div>
            <section className="mt-8 pb-12">
              <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Recent practice</h2><Link className="font-bold text-teal-700" href="/practice/part-5">Practice again</Link></div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {analytics.recentSessions.map((session, index) => <Link className={`flex items-center justify-between gap-4 p-5 hover:bg-slate-50 ${index ? "border-t border-slate-100" : ""}`} href={`/practice/part-5/${session.id}/results`} key={session.id}><div><p className="font-bold">{new Date(session.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p><p className="mt-1 text-sm text-slate-500">TOEIC Part 5</p></div><div className="text-right"><p className="font-black">{session.correct}/{session.total}</p><p className="text-sm text-slate-500">{session.accuracy}%</p></div></Link>)}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
