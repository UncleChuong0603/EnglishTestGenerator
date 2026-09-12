import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const features = [
  ["Curated questions", "Build confidence with reviewed TOEIC Listening & Reading content."],
  ["Useful taxonomy", "Track performance by part, skill, sub-skill, and difficulty."],
  ["Secure by design", "Published content is readable while answer keys stay server-only."],
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const href = user ? "/dashboard" : "/sign-in";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link className="text-xl font-black" href="/">TOEIC Practice</Link>
        <Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold" href={href}>
          {user ? "Dashboard" : "Sign in"}
        </Link>
      </nav>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-24">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-teal-700">
            TOEIC practice for Vietnamese learners
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">Practice with purpose.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A curated question bank built for focused practice, clear explanations, and future weakness analysis
            across TOEIC Parts 1–7.
          </p>
          <Link className="mt-8 inline-flex rounded-xl bg-teal-700 px-6 py-3 font-bold text-white" href={href}>
            Open your learning space
          </Link>
          <p className="mt-4 text-sm text-slate-500">Independent practice platform. Not affiliated with ETS.</p>
        </div>
        <aside className="rounded-3xl bg-slate-900 p-8 text-white">
          <p className="text-sm font-bold text-teal-300">Content first</p>
          <h2 className="mt-3 text-2xl font-bold">A dependable foundation</h2>
          <p className="mt-4 leading-7 text-slate-300">
            Questions are organized by TOEIC part and learning skill. Shared passages and listening media fit the
            same model, while solutions remain protected for server-side grading.
          </p>
        </aside>
      </section>
      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 md:grid-cols-3">
        {features.map(([title, body]) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-6" key={title}>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
