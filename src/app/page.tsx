import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const features = [
  ["Fresh reading practice", "Choose your level, question count, and focus. AI creates an original VSTEP-style passage and questions."],
  ["Instant, reliable scoring", "Your answers are compared with protected answer keys using deterministic server-side scoring."],
  ["A clear next step", "See performance by reading skill and receive an evidence-based practice recommendation."],
];

export default async function Home() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); const href = user ? "/dashboard" : "/sign-in";
  return <main className="min-h-screen bg-slate-50 text-slate-900"><nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6"><Link className="text-xl font-black" href="/">VSTEP Practice</Link><Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold" href={href}>{user ? "Dashboard" : "Sign in"}</Link></nav>
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-24"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-teal-700">Reading practice for Vietnamese learners</p><h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">Practise smarter. Understand every answer.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Generate focused VSTEP-style Reading tests, receive instant scores, identify current areas to improve, and get a practical recommendation for your next session.</p><Link className="mt-8 inline-flex rounded-xl bg-teal-700 px-6 py-3 font-bold text-white shadow-sm hover:bg-teal-800" href={href}>Start Practicing</Link><p className="mt-4 text-sm text-slate-500">Independent practice inspired by VSTEP formats. Not an official examination service.</p></div><aside className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl"><p className="text-sm font-bold text-teal-300">A simple learning loop</p><ol className="mt-6 space-y-5">{["Generate a level-appropriate reading test", "Answer 10 or 20 multiple-choice questions", "Review your score, explanations, and skill breakdown", "Practise the area that needs attention next"].map((step, i) => <li className="flex gap-4" key={step}><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-400 font-black text-slate-950">{i+1}</span><span className="pt-1 text-slate-200">{step}</span></li>)}</ol></aside></section>
    <section className="mx-auto max-w-6xl px-5 pb-20"><div className="grid gap-5 md:grid-cols-3">{features.map(([title, body]) => <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={title}><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-7 text-slate-600">{body}</p></article>)}</div></section>
  </main>;
}
