export const maxDuration = 60;

import Link from "next/link";
import { redirect } from "next/navigation";
import { GenerationForm } from "@/components/tests/generation-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewTestPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/sign-in");
  return <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900"><div className="mx-auto max-w-4xl"><Link className="font-semibold text-teal-700" href="/dashboard">← Dashboard</Link><p className="mt-8 text-sm font-bold uppercase tracking-wider text-teal-700">New practice</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Generate a reading test</h1><p className="mb-8 mt-3 max-w-2xl text-slate-600">Choose a level and focus. AI creates the passage and questions; deterministic code scores your answers.</p><GenerationForm/></div></main>;
}
