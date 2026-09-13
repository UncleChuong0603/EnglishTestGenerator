import Link from "next/link";
import { redirect } from "next/navigation";
import { RecommendationCard } from "@/components/analytics/recommendation-card";
import { LearnerNav } from "@/components/learner-nav";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { getCurrentProfile } from "@/lib/profiles/profile";
import { getReadingRecommendation } from "@/lib/practice/recommendation";
import { createClient } from "@/lib/supabase/server";
import { PracticeConfigurator } from "./practice-configurator";

type Props = { searchParams: Promise<{ error?: string }> };
export default async function ReadingPracticePage({ searchParams }: Props) {
  const [{ error }, supabase] = await Promise.all([searchParams, createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const [profile, preferences] = await Promise.all([getCurrentProfile(user.id), getPreferences(user.id)]);
  if (profile.status === "missing") redirect("/onboarding");
  const locale = preferences.interfaceLanguage; const t = getTranslations(locale);
  let recommendation; try { recommendation = await getReadingRecommendation(user.id); } catch (caught) { console.error("Could not load recommendation", caught); recommendation = null; }
  const errorMessage = error === "not_enough_content" ? t.practiceConfig.content : error === "invalid_config" ? t.practiceConfig.invalid : t.practiceConfig.startError;
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><LearnerNav locale={locale} /></div><div className="mx-auto mt-8 max-w-5xl"><Link className="text-sm font-semibold text-teal-700" href="/dashboard">← {t.practiceConfig.back}</Link><header className="mt-5"><p className="text-sm font-bold uppercase tracking-[.18em] text-teal-700">{t.practiceConfig.eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t.practiceConfig.title}</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">{t.practiceConfig.intro}</p></header>{error ? <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{errorMessage}</p> : null}{recommendation ? <div className="mt-8"><RecommendationCard dark locale={locale} recommendation={recommendation} /></div> : <section className="mt-8 rounded-3xl bg-slate-900 p-6 text-white sm:p-9"><p className="text-sm font-bold uppercase tracking-wider text-teal-300">{t.practiceConfig.fallbackLabel}</p><h2 className="mt-3 text-2xl font-black">{t.practiceConfig.fallbackTitle}</h2><p className="mt-3 text-slate-300">{t.practiceConfig.fallbackBody}</p></section>}<section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9" id="choose-focus"><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{t.practiceConfig.choose}</p><h2 className="mt-2 text-2xl font-black">{t.practiceConfig.configure}</h2><PracticeConfigurator locale={locale} /></section></div></main>;
}
