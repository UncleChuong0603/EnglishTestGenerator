import Link from "next/link";
import { startRecommendedPractice } from "@/app/practice/actions";
import { StartWorkoutButton } from "@/components/diagnosis/start-workout-button";
import type { WorkoutRecommendation } from "@/lib/diagnosis/types";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { formatMessage, getTranslations } from "@/lib/i18n/get-translations";
import { partName, taxonomyLabel } from "@/lib/i18n/labels";

export function UnifiedRecommendationCard({ recommendation, locale, dashboard = false, compact = false }: { recommendation: WorkoutRecommendation; locale: InterfaceLanguage; dashboard?: boolean; compact?: boolean }) {
  const t = getTranslations(locale).workout;
  const focus = recommendation.primarySubskill ?? recommendation.primarySkill;
  const isEarly = recommendation.reasonCode === "EARLY_EXPLORATION";
  const status = recommendation.evidence?.label ? t.status[recommendation.evidence.label] : isEarly ? t.earlySignal : null;
  const reason = recommendation.reasonCode === "SUPPORTED_WEAKNESS" && recommendation.evidence
    ? formatMessage(t.reasonSupported, { accuracy: recommendation.evidence.accuracy ?? 0, attempted: recommendation.evidence.attemptedCount })
    : isEarly ? t.reasonEarly : t.reasonBuild;
  const title = recommendation.kind === "EXPLORATION" ? t.buildProfile : `${recommendation.skillArea === "LISTENING" ? t.listening : t.reading} · Part ${recommendation.part}`;

  return <section className={`rounded-3xl border text-slate-900 shadow-sm ${compact ? "p-5 sm:p-6" : "p-6 sm:p-8"} ${dashboard ? `border-teal-300 bg-gradient-to-br from-white to-teal-50 ${status || recommendation.evidence ? "lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,1fr)] lg:gap-8" : ""}` : "border-teal-200 bg-teal-50"}`}>
    <div>
    <p className="text-sm font-bold uppercase tracking-wider text-teal-700">{dashboard ? t.today : t.recommendedNext}</p>
    <h2 className={`mt-2 font-black ${compact ? "text-xl" : "text-3xl"}`}>{title}</h2>
    {recommendation.part ? <p className="mt-2 font-semibold text-slate-600">Part {recommendation.part} · {partName(recommendation.part, locale)}</p> : null}
    {focus ? <p className={`${compact ? "mt-2 text-base" : "mt-3 text-xl"} font-bold`}>{taxonomyLabel(focus, locale)}</p> : null}
    {status && !dashboard ? <p className="mt-4 inline-flex rounded-full border border-teal-300 bg-white px-3 py-1 text-sm font-bold text-teal-900">{status}</p> : null}
    <h3 className={compact ? "sr-only" : "mt-5 font-black"}>{t.why}</h3>
    <p className={`${compact ? "mt-2 text-sm leading-6" : "mt-2 leading-7"} max-w-2xl text-slate-600`}>{reason}</p>
    <p className="mt-4 font-semibold text-slate-700">{recommendation.questionCount} {t.questions}{recommendation.groupCount ? ` · ${recommendation.groupCount} ${t.sets}` : ""}</p>
    <div className={`${compact ? "mt-4" : "mt-6"} flex flex-wrap items-center gap-4`}>
      <form action={startRecommendedPractice}><StartWorkoutButton idle={t.start} pending={t.starting} /></form>
      {dashboard ? <Link className="rounded-xl px-3 py-3 font-bold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/practice">{t.choose}</Link> : null}
    </div></div>
    {dashboard && (status || recommendation.evidence) ? <aside className="mt-6 flex flex-col justify-center rounded-2xl border border-teal-200 bg-white/80 p-5 lg:mt-0" aria-label={locale === "vi" ? "Tín hiệu luyện tập" : "Practice signal"}>{status ? <p className="text-sm font-bold text-teal-800">{status}</p> : null}{recommendation.evidence ? <><p className="mt-3 text-4xl font-black">{recommendation.evidence.accuracy === null ? "—" : `${recommendation.evidence.accuracy}%`}</p><p className="text-sm text-slate-600">{locale === "vi" ? "Độ chính xác hiện tại" : "Current accuracy"}</p><p className="mt-4 text-sm font-semibold text-slate-700">{recommendation.evidence.attemptedCount} {locale === "vi" ? "câu đã phân tích" : "questions analyzed"}</p></> : null}</aside> : null}
  </section>;
}

export function RecommendationUnavailable({ locale }: { locale: InterfaceLanguage }) {
  const t = getTranslations(locale).workout;
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{t.today}</p><h2 className="mt-2 text-2xl font-black">{t.unavailable}</h2><p className="mt-3 text-slate-600">{t.unavailableBody}</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-teal-700 px-6 py-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/practice">{t.choose}</Link></section>;
}
