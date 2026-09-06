import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profiles/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { aggregateStoredAnswers, formatSkill, getPerformanceInsights } from "@/lib/tests/analysis";
import type { Skill } from "@/lib/tests/types";
import { signOut } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/sign-in");
  const profileResult = await getCurrentProfile(user.id);
  if (profileResult.status === "missing") redirect("/onboarding");
  if (profileResult.status !== "found") {
    return <main className="p-10">We could not load your profile.</main>;
  }
  const { data: attempts, count } = await supabase.from("attempts").select("id, difficulty, correct_answers, total_questions, score_percent, submitted_at", { count: "exact" }).eq("status", "submitted").order("submitted_at", { ascending: false }).limit(10);
  const attemptIds = attempts?.map((attempt) => attempt.id) ?? []; const { data: answers } = attemptIds.length ? await supabase.from("attempt_answers").select("question_id, is_correct").in("attempt_id", attemptIds) : { data: [] };
  const admin = createAdminClient(); const questionIds = answers?.map((answer) => answer.question_id) ?? []; const { data: questions } = questionIds.length ? await admin.from("questions").select("id, skill").in("id", questionIds) : { data: [] };
  const skillMap = new Map(questions?.map((question) => [question.id, question.skill as Skill])); const results = aggregateStoredAnswers((answers ?? []).flatMap((answer) => { const skill=skillMap.get(answer.question_id); return skill ? [{ skill, isCorrect: answer.is_correct }] : []; })); const insights=getPerformanceInsights(results); const profile=profileResult.profile;
  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900"><div className="mx-auto max-w-6xl"><header className="flex items-center justify-between gap-4"><Link className="text-xl font-black" href="/">VSTEP Practice</Link><form action={signOut}><button className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold" type="submit">Sign out</button></form></header>
    <section className="mt-10 rounded-3xl bg-slate-900 p-8 text-white sm:p-10"><p className="text-sm font-bold uppercase tracking-wider text-teal-300">Your learning space</p><h1 className="mt-3 text-4xl font-black">Welcome, {profile.full_name ?? "learner"}</h1><p className="mt-3 max-w-xl text-slate-300">Your next set is selected from curated questions using your previous skill performance.</p><Link className="mt-7 inline-flex rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950" href="/practice">Start Practice</Link></section>
    <section className="mt-7 grid gap-5 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-500">Completed</p><p className="mt-2 text-3xl font-black">{count ?? 0}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-500">Current strengths</p><p className="mt-2 font-bold">{insights.strengths.length ? insights.strengths.map((item) => formatSkill(item.skill)).join(", ") : "Complete a set to find out"}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-500">Recommended next step</p><p className="mt-2 text-sm leading-6">{insights.recommendation.message}</p></div></section>
    <section className="mt-10"><h2 className="text-2xl font-bold">Recent attempts</h2><div className="mt-5 space-y-3">{attempts?.length ? attempts.map((attempt) => <Link className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-500" href={`/results/${attempt.id}`} key={attempt.id}><div><p className="font-bold">{attempt.difficulty} adaptive Reading</p><p className="mt-1 text-sm text-slate-500">{attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString() : "Completed"}</p></div><p className="text-xl font-black">{attempt.correct_answers}/{attempt.total_questions} <span className="text-sm text-slate-500">({Math.round(Number(attempt.score_percent))}%)</span></p></Link>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-bold">No tests completed yet.</p><p className="mt-2 text-slate-600">Start your first adaptive practice set to build a learning history.</p></div>}</div></section>
  </div></main>;
}
