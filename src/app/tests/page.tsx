import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function TestsPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/sign-in");
  const { data: tests } = await supabase.from("tests").select("id, title, difficulty, question_count, created_at").order("created_at", { ascending: false });
  return <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900"><div className="mx-auto max-w-4xl"><div className="flex items-center justify-between"><Link className="font-semibold text-teal-700" href="/dashboard">← Dashboard</Link><Link className="rounded-xl bg-teal-700 px-4 py-2 font-bold text-white" href="/tests/new">Generate test</Link></div><h1 className="mt-10 text-4xl font-bold">Your reading tests</h1><div className="mt-8 grid gap-4">{tests?.length ? tests.map((test) => <Link className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-500" href={`/tests/${test.id}`} key={test.id}><p className="font-bold">{test.title}</p><p className="mt-2 text-sm text-slate-600">{test.difficulty} · {test.question_count} questions</p></Link>) : <p className="rounded-2xl bg-white p-8 text-slate-600">No tests generated yet.</p>}</div></div></main>;
}
