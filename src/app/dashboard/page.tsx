import Link from "next/link";
import { redirect } from "next/navigation";

import { PerformanceList } from "@/components/analytics/performance-list";
import { LearnerNav } from "@/components/learner-nav";
import { getLearnerAnalytics } from "@/lib/analytics/queries";
import type { LearnerAnalytics } from "@/lib/analytics/types";
import { getCurrentProfile } from "@/lib/profiles/profile";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const profileResult = await getCurrentProfile(user.id);
  if (profileResult.status === "missing") redirect("/onboarding");
  if (profileResult.status === "error") {
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><h1 className="text-2xl font-black">We couldn&apos;t load your dashboard</h1><p className="mt-2 text-slate-600">Please refresh the page and try again.</p></div></main>;
  }

  let analytics: LearnerAnalytics | null = null;
  try {
    analytics = await getLearnerAnalytics(user.id);
  } catch (error) {
    console.error("Could not load dashboard analytics", error);
  }
  const hasData = Boolean(analytics?.totalAttempted);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <LearnerNav />
        <section className="mt-8 grid gap-6 rounded-3xl bg-slate-900 p-7 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-teal-300">TOEIC Part 5 practice</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Welcome, {profileResult.profile.full_name ?? user.email ?? "learner"}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">Improve your grammar and vocabulary through short practice sessions with instant bilingual explanations.</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-400 px-6 py-3 font-bold text-slate-950 hover:bg-teal-300" href="/practice/part-5">Start practice</Link>
        </section>

        {!analytics ? <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900" role="alert">We couldn&apos;t load your progress right now. You can still start a practice session.</p> : null}

        <section className="mt-7 grid gap-4 sm:grid-cols-3" aria-label="Quick statistics">
          {[
            ["Questions answered", analytics?.totalAttempted ?? 0],
            ["Overall accuracy", hasData ? `${analytics?.overallAccuracy}%` : "—"],
            ["Practice sessions", analytics?.sessionCount ?? 0],
          ].map(([label, value]) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></article>)}
        </section>

        {hasData && analytics ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl font-black">Skill overview</h2><Link className="text-sm font-bold text-teal-700" href="/progress">Full progress</Link></div>
              <PerformanceList metrics={analytics.skills} />
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-black">Areas to focus on</h2>
              {analytics.focusAreas.length ? <div className="mt-5"><PerformanceList metrics={analytics.focusAreas} /></div> : <p className="mt-4 leading-7 text-slate-600">Keep practicing. We need at least 5 answers in a subskill before identifying a focus area confidently.</p>}
            </section>
          </div>
        ) : (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center sm:p-10">
            <h2 className="text-xl font-black">Your insights will appear here</h2>
            <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">Complete a few Part 5 sessions to discover your grammar and vocabulary strengths and focus areas.</p>
            <Link className="mt-5 inline-flex rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" href="/practice/part-5">Start your first practice</Link>
          </section>
        )}

        <section className="mt-10 pb-12">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Recent practice</h2><Link className="font-bold text-teal-700" href="/practice/part-5">Start another session</Link></div>
          <div className="mt-5 space-y-3">
            {analytics?.recentSessions.length ? analytics.recentSessions.map((session) => (
              <Link className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-500" href={`/practice/part-5/${session.id}/results`} key={session.id}>
                <div><p className="font-bold">TOEIC Part 5</p><p className="mt-1 text-sm text-slate-500">{new Date(session.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></div>
                <div className="text-right"><p className="text-xl font-black">{session.correct}/{session.total}</p><p className="text-sm text-slate-500">{session.accuracy}% accuracy</p></div>
              </Link>
            )) : <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">You haven&apos;t completed any practice sessions yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
