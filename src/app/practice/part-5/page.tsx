import Link from "next/link";
import { redirect } from "next/navigation";

import { LearnerNav } from "@/components/learner-nav";
import { getCurrentProfile } from "@/lib/profiles/profile";
import { createClient } from "@/lib/supabase/server";
import { startPart5Practice } from "../actions";
import { StartButton } from "./start-button";

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function Part5StartPage({ searchParams }: PageProps) {
  const [{ error }, supabase] = await Promise.all([searchParams, createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const profile = await getCurrentProfile(user.id);
  if (profile.status === "missing") redirect("/onboarding");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl"><LearnerNav /></div>
      <section className="mx-auto mt-8 max-w-2xl">
        <Link className="text-sm font-semibold text-teal-700" href="/dashboard">← Dashboard</Link>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-teal-700">TOEIC Reading</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Part 5 practice</h1>
          <p className="mt-4 leading-7 text-slate-600">Complete incomplete sentences by choosing the best word or phrase. You can leave questions unanswered and review every explanation after submitting.</p>
          <dl className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Estimated time</dt><dd className="mt-1 font-bold">5–10 minutes</dd></div>
            <div><dt className="text-slate-500">Focus</dt><dd className="mt-1 font-bold">Grammar &amp; vocabulary</dd></div>
          </dl>
          {error === "start_failed" ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">We couldn&apos;t start your practice right now. Please try again.</p> : null}
          <form action={startPart5Practice} className="mt-8 space-y-6">
            <fieldset>
              <legend className="font-bold">Number of questions</legend>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[10, 20].map((count) => <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-slate-300 p-4 has-checked:border-teal-600 has-checked:bg-teal-50" key={count}><input defaultChecked={count === 10} name="questionCount" type="radio" value={count} /><span><strong>{count}</strong> questions</span></label>)}
              </div>
            </fieldset>
            <StartButton />
          </form>
        </div>
      </section>
    </main>
  );
}
