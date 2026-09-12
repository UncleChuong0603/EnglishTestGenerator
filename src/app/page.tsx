import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const features = [
  ["Short, focused practice", "Complete 10 or 20 TOEIC Part 5 questions whenever you have a few minutes."],
  ["Instant explanations", "Review every answer with clear explanations in English and Vietnamese."],
  ["Know what to improve", "Track accuracy by grammar, vocabulary, and the subskills that matter."],
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const href = user ? "/dashboard" : "/sign-in";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link className="text-xl font-black" href="/">TOEIC Practice</Link>
        <Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold" href={href}>{user ? "Dashboard" : "Sign in"}</Link>
      </nav>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-24">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-teal-700">TOEIC practice for Vietnamese learners</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Practice TOEIC smarter.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Complete short Part 5 exercises, review detailed explanations, and discover the grammar and vocabulary areas you need to improve.</p>
          <Link className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-teal-700 px-6 py-3 font-bold text-white" href={href}>{user ? "Continue practicing" : "Start practicing"}</Link>
          <p className="mt-4 text-sm text-slate-500">Independent practice platform. Not affiliated with ETS.</p>
        </div>
        <aside className="rounded-3xl bg-slate-900 p-7 text-white sm:p-8">
          <p className="text-sm font-bold text-teal-300">Focused on Part 5</p>
          <h2 className="mt-3 text-2xl font-bold">Build accuracy one set at a time</h2>
          <p className="mt-4 leading-7 text-slate-300">Choose the best word or phrase to complete each sentence. After submitting, see your score, review every answer, and learn where to focus next.</p>
        </aside>
      </section>
      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 md:grid-cols-3">
        {features.map(([title, body]) => <article className="rounded-2xl border border-slate-200 bg-white p-6" key={title}><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-7 text-slate-600">{body}</p></article>)}
      </section>
    </main>
  );
}
