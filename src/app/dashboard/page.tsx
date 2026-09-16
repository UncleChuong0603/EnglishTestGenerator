import Link from "next/link";
import { redirect } from "next/navigation";
import { RecommendationUnavailable, UnifiedRecommendationCard } from "@/components/diagnosis/recommendation-card";
import { LearnerNav } from "@/components/learner-nav";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/dashboard/service";
import { formatTimer, remainingSeconds } from "@/lib/demo-test/composition";
import { getActiveDemoTest } from "@/lib/demo-test/queries";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getCurrentProfile } from "@/lib/profiles/profile";
import type { SkillAreaProgress } from "@/lib/progress/types";

function ProgressCard({ area, locale }: { area: SkillAreaProgress; locale: InterfaceLanguage }) {
  const t = getTranslations(locale).workout;
  const title = area.skillArea === "LISTENING" ? t.listening : t.reading;
  return <article className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="text-lg font-black">{title}</h3>
    {area.accuracy === null ? <p className="mt-4 text-lg font-semibold text-slate-500">{t.noData}</p> : <><p className="mt-3 text-3xl font-black">{area.accuracy}%</p><div aria-label={`${title}: ${area.accuracy}%`} className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="img"><div className="h-full rounded-full bg-teal-600" style={{ width: `${area.accuracy}%` }} /></div><p className="mt-3 text-sm text-slate-600">{area.attemptedCount} {t.questionsPracticed}</p></>}
  </article>;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const [profileResult, preferences] = await Promise.all([getCurrentProfile(user.id), getPreferences(user.id)]);
  const locale = preferences.interfaceLanguage;
  const translations = getTranslations(locale);
  if (profileResult.status === "missing") redirect("/onboarding");
  if (profileResult.status === "error") return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><h1 className="text-2xl font-black">{translations.dashboard.loadErrorTitle}</h1><p className="mt-2 text-slate-600">{translations.dashboard.loadErrorBody}</p></div></main>;

  const [dashboardResult, activeDemo] = await Promise.all([
    getDashboardData(user.id).catch((error) => { console.error("Could not load dashboard data", error); return null; }),
    getActiveDemoTest(user.id).catch((error) => { console.error("Could not load active demo", error); return null; }),
  ]);
  const profile = profileResult.profile!;
  const t = translations.workout;

  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8"><div className="mx-auto max-w-5xl">
    <LearnerNav locale={locale} />
    <header className="mt-8"><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{translations.dashboard.welcome}</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{profile.full_name ?? user.email ?? "Learner"}</h1></header>
    <div className="mt-7">{dashboardResult?.recommendation ? <UnifiedRecommendationCard dashboard locale={locale} recommendation={dashboardResult.recommendation} /> : <RecommendationUnavailable locale={locale} />}</div>

    <section className="mt-8" aria-labelledby="progress-heading"><div className="flex flex-wrap items-end justify-between gap-3"><h2 className="text-2xl font-black" id="progress-heading">{t.progressTitle}</h2><Link className="font-bold text-teal-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/progress">{t.viewProgress}</Link></div>
      {dashboardResult ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><ProgressCard area={dashboardResult.progress.listening} locale={locale} /><ProgressCard area={dashboardResult.progress.reading} locale={locale} /></div> : <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900" role="alert">{translations.dashboard.progressError}</p>}
    </section>

    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"><div><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{translations.demoTest.shortTitle}</p><h2 className="mt-1 text-xl font-black">{activeDemo ? translations.demoTest.resume : translations.demoTest.dashboardTitle}</h2><p className="mt-2 text-slate-600">{activeDemo ? `${translations.demoTest.timeRemaining}: ${formatTimer(remainingSeconds(activeDemo.expires_at))}` : translations.demoTest.dashboardBody}</p></div><Link className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:mt-0" href={activeDemo ? `/demo-test/${activeDemo.id}` : "/demo-test"}>{activeDemo ? translations.demoTest.resume : translations.demoTest.start}</Link></section>
  </div></main>;
}
