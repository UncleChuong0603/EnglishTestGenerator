/* eslint-disable react-hooks/error-boundaries */
import Link from "next/link";
import { redirect } from "next/navigation";
import { UnifiedRecommendationCard as RecommendationCard } from "@/components/diagnosis/recommendation-card";
import { LearnerNav } from "@/components/learner-nav";
import { getCurrentUser } from "@/lib/auth/session";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { taxonomyLabel } from "@/lib/i18n/labels";
import { loadRecommendedWorkout } from "@/lib/diagnosis/service";
import { getToeicProgress } from "@/lib/progress/queries";
import type { PartProgress, SkillAreaProgress } from "@/lib/progress/types";

function Accuracy({ value, noData }: { value: number | null; noData: string }) { return <>{value === null ? noData : `${value}%`}</>; }

function PartCard({ item, locale }: { item: PartProgress; locale: InterfaceLanguage }) {
  const t = getTranslations(locale);
  return <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">Part {item.part}</h3><p className="mt-2 text-3xl font-black"><Accuracy noData={t.progress.noDataYet} value={item.accuracy} /></p><p className="mt-2 text-sm text-slate-600">{item.correctCount}/{item.attemptedCount} {t.progress.correct}</p></article>;
}

function SkillList({ area, locale }: { area: SkillAreaProgress; locale: InterfaceLanguage }) {
  const t = getTranslations(locale); if (!area.skills.length) return null;
  return <div className="mt-7 border-t border-slate-100 pt-6"><h3 className="text-lg font-black">{t.progress.skills}</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{area.skills.map((skill) => <article className="rounded-xl bg-slate-50 p-4" key={skill.name}><div className="flex items-start justify-between gap-3"><div><h4 className="font-black">{taxonomyLabel(skill.name, locale)}</h4><p className="mt-1 text-sm text-slate-500">{skill.correctCount}/{skill.attemptedCount} {t.progress.correct}</p></div><strong><Accuracy noData={t.progress.noDataYet} value={skill.accuracy} /></strong></div>{skill.subskills.length ? <ul className="mt-3 space-y-2" aria-label={t.progress.subskills}>{skill.subskills.map((subskill) => <li className="flex justify-between gap-3 border-t border-slate-200 pt-2 text-sm" key={subskill.name}><span>{taxonomyLabel(subskill.name, locale)}</span><span className="font-bold">{subskill.correctCount}/{subskill.attemptedCount} · <Accuracy noData={t.progress.noDataYet} value={subskill.accuracy} /></span></li>)}</ul> : null}</article>)}</div></div>;
}

function AreaSection({ area, locale }: { area: SkillAreaProgress; locale: InterfaceLanguage }) {
  const t = getTranslations(locale); const title = area.skillArea === "LISTENING" ? t.progress.listening : t.progress.reading;
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8" aria-labelledby={`area-${area.skillArea}`}><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-black" id={`area-${area.skillArea}`}>{title}</h2><p className="mt-2 text-slate-600">{area.attemptedCount ? `${area.attemptedCount} ${t.progress.questionsPracticed}` : t.progress.noDataYet}</p></div><p className="text-4xl font-black"><Accuracy noData="—" value={area.accuracy} /></p></div><div className={`mt-6 grid gap-4 sm:grid-cols-2 ${area.parts.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>{area.parts.map((part) => <PartCard item={part} key={part.part} locale={locale} />)}</div><SkillList area={area} locale={locale} /></section>;
}

export default async function ProgressPage() {
  const user = await getCurrentUser(); if (!user) redirect("/sign-in");
  const preferences = await getPreferences(user.id); const locale = preferences.interfaceLanguage; const t = getTranslations(locale);
  try {
    const [progress, recommendation] = await Promise.all([getToeicProgress(user.id), loadRecommendedWorkout(user.id).catch((error) => { console.error("Could not load recommendation", error); return null; })]);
    return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><LearnerNav locale={locale} /><header className="mt-10"><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{t.progress.eyebrow}</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{t.progress.toeicTitle}</h1><p className="mt-3 max-w-3xl leading-7 text-slate-600">{t.progress.unifiedIntro}</p></header>{progress.attemptedCount === 0 ? <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12"><h2 className="text-2xl font-black">{t.progress.noPracticeYet}</h2><p className="mt-3 text-slate-600">{t.progress.startBuilding}</p><Link className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" href="/practice">{t.progress.startPracticing}</Link></section> : null}<div className="mt-8 space-y-7"><AreaSection area={progress.listening} locale={locale} /><AreaSection area={progress.reading} locale={locale} /></div>{recommendation ? <div className="mt-7"><RecommendationCard locale={locale} recommendation={recommendation} /></div> : null}<div className="pb-12" /></div></main>;
  } catch (error) {
    console.error("Could not load progress page", error); return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><h1 className="text-2xl font-black">{t.progress.loadError}</h1><p className="mt-2 text-slate-600">{t.progress.tryAgain}</p><Link className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" href="/progress">{t.common.retry}</Link></div></main>;
  }
}
