import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StartTestButton } from "@/components/tests/start-test-button";
import { createClient } from "@/lib/supabase/server";
import { getOwnedTest } from "@/lib/tests/data";

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/sign-in");
  const result = await getOwnedTest(testId, user.id); if (!result) notFound();
  return <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900"><div className="mx-auto max-w-3xl"><Link className="font-semibold text-teal-700" href="/tests">← Your tests</Link><section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{result.test.difficulty} reading practice</p><h1 className="mt-3 text-4xl font-bold">{result.test.title}</h1><p className="mt-4 text-slate-600">{result.test.question_count} questions · Focus: {result.test.focus.replaceAll("_", " ")}</p><p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">This is VSTEP-style practice, not an official VSTEP examination.</p><div className="mt-8"><StartTestButton testId={testId}/></div></section></div></main>;
}
