import Link from "next/link";
import { redirect } from "next/navigation";
import { RecommendationCard } from "@/components/analytics/recommendation-card";
import { LearnerNav } from "@/components/learner-nav";
import { getLearnerAnalytics } from "@/lib/analytics/queries";
import type { LearnerAnalytics, PerformanceMetric } from "@/lib/analytics/types";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { modeLabel, partTitle, statusLabel, taxonomyLabel } from "@/lib/i18n/labels";
import { getCurrentProfile } from "@/lib/profiles/profile";
import { getReadingRecommendation } from "@/lib/practice/recommendation";
import { createClient } from "@/lib/supabase/server";

function FocusRow({ metric, locale }: { metric: PerformanceMetric; locale: "en" | "vi" }) {
  const t = getTranslations(locale);
  return <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"><div><p className="font-bold">Part {metric.part} — {taxonomyLabel(metric.name, locale)}</p><p className="mt-1 text-sm text-slate-500">{metric.correct}/{metric.attempted} {t.dashboard.correct} · {statusLabel(metric.status, locale)}</p></div><p className="text-xl font-black">{metric.accuracy}%</p></div>;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const [profileResult, preferences] = await Promise.all([getCurrentProfile(user.id), getPreferences(user.id)]);
  const t = getTranslations(preferences.interfaceLanguage);
  if (profileResult.status === "missing") redirect("/onboarding");
  if (profileResult.status === "error") return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><h1 className="text-2xl font-black">{t.dashboard.loadErrorTitle}</h1><p className="mt-2 text-slate-600">{t.dashboard.loadErrorBody}</p></div></main>;
  let analytics: LearnerAnalytics | null = null;
  try { analytics = await getLearnerAnalytics(user.id); } catch (error) { console.error("Could not load dashboard analytics", error); }
  let recommendation = null;
  try { recommendation = await getReadingRecommendation(user.id, analytics ?? undefined); } catch (error) { console.error("Could not load dashboard recommendation", error); }
  const hasData = Boolean(analytics?.totalAttempted);
  const locale = preferences.interfaceLanguage;
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><LearnerNav locale={locale} />
    <section className="mt-8 grid gap-6 rounded-3xl bg-slate-900 p-7 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-sm font-bold uppercase tracking-wider text-teal-300">{t.dashboard.eyebrow}</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{t.dashboard.welcome}, {profileResult.profile.full_name ?? user.email ?? "learner"}</h1><p className="mt-3 max-w-2xl leading-7 text-slate-300">{t.dashboard.intro}</p></div><Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-400 px-6 py-3 font-bold text-slate-950" href="/practice">{t.dashboard.start}</Link></section>
    {!analytics ? <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900" role="alert">{t.dashboard.progressError}</p> : null}
    <section className="mt-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{t.dashboard.progress}</p><h2 className="mt-1 text-2xl font-black">{t.dashboard.overview}</h2></div><Link className="text-sm font-bold text-teal-700" href="/progress">{t.dashboard.fullProgress}</Link></div><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[t.dashboard.overallAccuracy, hasData ? `${analytics!.overallAccuracy}%` : "—"], [t.dashboard.recent20, hasData ? `${analytics!.recentAccuracy}%` : "—"], [t.dashboard.questionsAnswered, analytics?.totalAttempted ?? 0], [t.dashboard.sessions, analytics?.sessionCount ?? 0]].map(([label, value]) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></article>)}</div><div className="mt-4 grid gap-4 md:grid-cols-3">{analytics?.partDetails.map(({ part, metric }) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={part}><p className="font-black">Part {part} — {partTitle(part, locale)}</p><div className="mt-3 flex items-end justify-between"><p className="text-3xl font-black">{metric.attempted ? `${metric.accuracy}%` : "—"}</p><p className="text-sm font-bold text-slate-600">{statusLabel(metric.status, locale)}</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-teal-600" style={{ width: `${metric.accuracy}%` }} /></div><p className="mt-3 text-sm text-slate-500">{metric.correct}/{metric.attempted} {t.dashboard.correct}{metric.trend !== "Not enough data" ? ` · ${statusLabel(metric.trend, locale)}` : ""}</p></article>)}</div></section>
    {recommendation ? <div className="mt-7"><RecommendationCard locale={locale} recommendation={recommendation} /></div> : null}
    {hasData && analytics ? <div className="mt-7 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">{t.dashboard.areasImprove}</h2><p className="mt-1 text-sm text-slate-500">{t.dashboard.reliableOnly}</p><div className="mt-5 space-y-3">{analytics.focusAreas.length ? analytics.focusAreas.map((metric) => <FocusRow key={`${metric.part}:${metric.skill}:${metric.name}`} locale={locale} metric={metric} />) : <p className="leading-7 text-slate-600">{t.dashboard.noWeakness}</p>}</div></section>{analytics.strongAreas.length ? <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">{t.dashboard.strongAreas}</h2><p className="mt-1 text-sm text-slate-500">{t.dashboard.strongRule}</p><div className="mt-5 space-y-3">{analytics.strongAreas.map((metric) => <FocusRow key={`${metric.part}:${metric.skill}:${metric.name}`} locale={locale} metric={metric} />)}</div></section> : null}</div> : <section className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center sm:p-10"><h2 className="text-xl font-black">{t.dashboard.insightsTitle}</h2><p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">{t.dashboard.insightsBody}</p><Link className="mt-5 inline-flex rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" href="/practice">{t.dashboard.firstPractice}</Link></section>}
    <section className="mt-10 pb-12"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">{t.dashboard.recentPractice}</h2><Link className="font-bold text-teal-700" href="/practice">{t.dashboard.another}</Link></div><div className="mt-5 space-y-3">{analytics?.recentSessions.length ? analytics.recentSessions.map((session) => <Link className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5" href={`/practice/${session.id}/results`} key={session.id}><div><p className="font-bold">{modeLabel(session.mode, locale)}</p><p className="mt-1 text-sm text-slate-500">{new Date(session.submittedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></div><div className="text-right"><p className="text-xl font-black">{session.correct}/{session.total}</p><p className="text-sm text-slate-500">{session.accuracy}% {t.dashboard.accuracy}</p></div></Link>) : <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">{t.dashboard.noSessions}</p>}</div></section>
  </div></main>;
}
