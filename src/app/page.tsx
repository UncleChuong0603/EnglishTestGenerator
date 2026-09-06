import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const features = [
  ["Curated question bank", "Practise with reviewed passages and questions designed for useful Reading skills."],
  ["Instant scoring", "Receive a deterministic score and review every answer with a clear explanation."],
  ["Practice that adapts", "Lower-performing skills receive more attention without removing stronger skills from the mix."],
];

export default async function Home() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); const href=user ? "/dashboard" : "/sign-in";
  return <main className="min-h-screen bg-slate-50 text-slate-900"><nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6"><Link className="text-xl font-black" href="/">VSTEP Practice</Link><Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold" href={href}>{user ? "Dashboard" : "Sign in"}</Link></nav><section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-24"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-teal-700">Reading practice for Vietnamese learners</p><h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">Focused practice, chosen for you.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Build Reading confidence with curated VSTEP-style questions, instant scoring, skill insights, and balanced practice that responds to your history.</p><Link className="mt-8 inline-flex rounded-xl bg-teal-700 px-6 py-3 font-bold text-white" href={href}>Start Practicing</Link><p className="mt-4 text-sm text-slate-500">Independent practice inspired by VSTEP formats. Not an official examination service.</p></div><aside className="rounded-3xl bg-slate-900 p-8 text-white"><p className="text-sm font-bold text-teal-300">How adaptation works</p><h2 className="mt-3 text-2xl font-bold">Balanced, not repetitive</h2><p className="mt-4 leading-7 text-slate-300">The system measures your accuracy by skill. Future sets give extra weight to current areas to improve while keeping vocabulary, main idea, detail, inference, and reference questions in rotation.</p></aside></section><section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 md:grid-cols-3">{features.map(([title,body]) => <article className="rounded-2xl border border-slate-200 bg-white p-6" key={title}><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-7 text-slate-600">{body}</p></article>)}</section></main>;
}
