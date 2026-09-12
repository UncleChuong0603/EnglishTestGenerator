import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/profiles/profile";
import { createClient } from "@/lib/supabase/server";
import { startPart5Practice } from "../actions";

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function Part5StartPage({ searchParams }: PageProps) {
  const [{ error }, supabase] = await Promise.all([searchParams, createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const profile = await getCurrentProfile(user.id);
  if (profile.status === "missing") redirect("/onboarding");

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <section className="mx-auto max-w-2xl">
        <Link className="text-sm font-semibold text-teal-700" href="/dashboard">← Dashboard</Link>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-teal-700">TOEIC Reading</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Part 5 practice</h1>
          <p className="mt-4 leading-7 text-slate-600">
            Complete incomplete sentences by choosing the best word or phrase. You can leave questions unanswered
            and review every explanation after submitting.
          </p>
          {error === "start_failed" ? (
            <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">
              We could not start a practice set. Confirm that published Part 5 questions are available, then try again.
            </p>
          ) : null}
          <form action={startPart5Practice} className="mt-8 space-y-6">
            <fieldset>
              <legend className="font-bold">Number of questions</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[10, 20].map((count) => (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 p-4" key={count}>
                    <input defaultChecked={count === 10} name="questionCount" type="radio" value={count} />
                    <span><strong>{count}</strong> questions</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800" type="submit">
              Start practice
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
