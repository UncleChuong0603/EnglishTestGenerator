import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/profiles/profile";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const profileResult = await getCurrentProfile(user.id);
  if (profileResult.status === "missing") redirect("/onboarding");
  if (profileResult.status === "error") {
    return <main className="min-h-screen bg-slate-50 p-10 text-center text-slate-700">We could not load your profile. Please try again.</main>;
  }

  const { data: sessions, count, error } = await supabase
    .from("practice_sessions")
    .select("id, score_correct, score_total, submitted_at", { count: "exact" })
    .eq("user_id", user.id)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(10);

  if (error) console.error("Could not load practice history", error);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Link className="text-xl font-black" href="/">TOEIC Practice</Link>
          <form action={signOut}>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold" type="submit">Sign out</button>
          </form>
        </header>
        <section className="mt-10 grid gap-6 rounded-3xl bg-slate-900 p-8 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-teal-300">Your learning space</p>
            <h1 className="mt-3 text-4xl font-black">Welcome, {profileResult.profile.full_name ?? user.email ?? "learner"}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">Practice curated TOEIC Part 5 questions and review clear English and Vietnamese explanations.</p>
          </div>
          <Link className="inline-flex justify-center rounded-xl bg-teal-500 px-6 py-3 font-bold text-slate-950 hover:bg-teal-400" href="/practice/part-5">Open Part 5 practice</Link>
        </section>
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Practice sets completed</p>
          <p className="mt-2 text-3xl font-black">{count ?? 0}</p>
        </section>
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Recent Part 5 practice</h2>
            <Link className="font-semibold text-teal-700" href="/practice/part-5">Start another set</Link>
          </div>
          <div className="mt-5 space-y-3">
            {sessions?.length ? sessions.map((session) => (
              <Link className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-500" href={`/practice/part-5/${session.id}/results`} key={session.id}>
                <div><p className="font-bold">TOEIC Part 5</p><p className="mt-1 text-sm text-slate-500">{session.submitted_at ? new Date(session.submitted_at).toLocaleDateString("en-GB") : "Completed"}</p></div>
                <p className="text-xl font-black">{session.score_correct} / {session.score_total}</p>
              </Link>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="font-bold">No completed practice yet.</p>
                <p className="mt-2 text-slate-600">Start a Part 5 set to build your practice history.</p>
                <Link className="mt-5 inline-flex rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white" href="/practice/part-5">Start your first practice</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
