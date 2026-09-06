import Link from "next/link";
import { redirect } from "next/navigation";
import { PracticeForm } from "@/components/tests/practice-form";
import { createClient } from "@/lib/supabase/server";

export default async function PracticePage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/sign-in");
  return <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900"><div className="mx-auto max-w-3xl"><Link className="font-semibold text-teal-700" href="/dashboard">← Dashboard</Link><p className="mt-8 text-sm font-bold uppercase tracking-wider text-teal-700">Adaptive Reading practice</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Start a balanced practice set</h1><p className="mb-8 mt-3 max-w-2xl text-slate-600">The system uses your history to emphasize current areas to improve, while continuing to practise every core Reading skill.</p><PracticeForm/></div></main>;
}
