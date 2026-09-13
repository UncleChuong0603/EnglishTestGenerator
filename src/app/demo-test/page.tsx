import Link from "next/link";
import { redirect } from "next/navigation";
import { LearnerNav } from "@/components/learner-nav";
import { getActiveDemoTest } from "@/lib/demo-test/queries";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
import { startDemoTest } from "./actions";

export default async function DemoTestIntroduction({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  if (!user) redirect("/sign-in");
  const [preferences, active] = await Promise.all([getPreferences(user.id), getActiveDemoTest(user.id)]);
  const t = getTranslations(preferences.interfaceLanguage);
  const error = params.error === "database_update_required" ? t.demoTest.migrationError
    : params.error ? t.demoTest.contentError : null;
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8"><div className="mx-auto max-w-5xl"><LearnerNav locale={preferences.interfaceLanguage} />
    <section className="mt-8 overflow-hidden rounded-3xl bg-slate-900 text-white"><div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.2fr_.8fr]"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-teal-300">Assessment simulation</p><h1 className="mt-3 text-3xl font-black sm:text-5xl">{t.demoTest.title}</h1><div className="mt-6 flex gap-3"><span className="rounded-full bg-white/10 px-4 py-2 font-bold">{t.demoTest.questions}</span><span className="rounded-full bg-white/10 px-4 py-2 font-bold">{t.demoTest.duration}</span></div><p className="mt-6 max-w-xl leading-7 text-slate-300">{t.demoTest.intro}</p><p className="mt-4 max-w-xl border-l-2 border-teal-300 pl-4 text-sm leading-6 text-slate-300">{t.demoTest.disclaimer}</p></div>
    <div className="grid gap-3 self-center">{([[5, "30", t.parts.title5], [6, "16", t.parts.title6], [7, "54", t.parts.title7]] as const).map(([part, count, title]) => <article className="rounded-2xl bg-white/8 p-4" key={part}><div className="flex items-center justify-between"><div><p className="font-black">Part {part}</p><p className="text-sm text-slate-300">{title}</p></div><p className="text-2xl font-black text-teal-300">{count}</p></div></article>)}</div></div></section>
    {error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</p> : null}
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"><div><h2 className="text-xl font-black">{active ? t.demoTest.resume : t.demoTest.start}</h2>{active ? <p className="mt-1 text-slate-600">{t.demoTest.resumeBody}</p> : null}</div>{active ? <Link className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-6 py-3 font-bold text-white sm:mt-0" href={`/demo-test/${active.id}`}>{t.demoTest.resume}</Link> : <form action={startDemoTest} className="mt-4 sm:mt-0"><button className="min-h-12 rounded-xl bg-teal-700 px-6 py-3 font-bold text-white" type="submit">{t.demoTest.start}</button></form>}</section>
  </div></main>;
}
