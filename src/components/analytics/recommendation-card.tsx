import Link from "next/link";
import { startReadingPractice } from "@/app/practice/actions";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { formatMessage, getTranslations } from "@/lib/i18n/get-translations";
import { modeLabel, statusLabel, taxonomyLabel } from "@/lib/i18n/labels";
import type { ReadingRecommendation } from "@/lib/practice/types";

function reasonFor(recommendation: ReadingRecommendation, locale: InterfaceLanguage) {
  const t = getTranslations(locale);
  if (recommendation.accuracy === null) return t.recommendation.defaultReason;
  let reason = formatMessage(t.recommendation.reason, { accuracy: recommendation.accuracy, attempted: recommendation.attemptCount });
  if (recommendation.recentAccuracy !== null) reason += formatMessage(t.recommendation.recentReason, { recent: recommendation.recentAccuracy });
  if (recommendation.trend === "Declining") reason += t.recommendation.decliningReason;
  else if (recommendation.trend === "Improving") reason += t.recommendation.improvingReason;
  reason += recommendation.focusLevel !== "mixed" && recommendation.accuracy >= 85 ? t.recommendation.strongReason : t.recommendation.priorityReason;
  return reason;
}

export function RecommendationCard({ recommendation, locale, dark = false }: { recommendation: ReadingRecommendation; locale: InterfaceLanguage; dark?: boolean }) {
  const t = getTranslations(locale);
  const focus = recommendation.subSkill ?? recommendation.skill;
  return <section className={`rounded-3xl p-6 sm:p-8 ${dark ? "bg-slate-900 text-white" : "border border-teal-200 bg-teal-50 text-slate-900"}`}><p className={`text-sm font-bold uppercase tracking-wider ${dark ? "text-teal-300" : "text-teal-700"}`}>{t.recommendation.label}</p><h2 className="mt-2 text-2xl font-black">{recommendation.part ? `Part ${recommendation.part}${focus ? ` — ${taxonomyLabel(focus, locale)}` : ""}` : modeLabel("mixed_reading", locale)}</h2>{recommendation.accuracy !== null ? <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold"><span>{recommendation.accuracy}% {t.recommendation.overall}</span>{recommendation.recentAccuracy !== null ? <span>{recommendation.recentAccuracy}% {t.recommendation.recent}</span> : null}{recommendation.trend !== "Not enough data" ? <span>{statusLabel(recommendation.trend, locale)}</span> : null}</div> : null}<p className={`mt-3 max-w-3xl leading-7 ${dark ? "text-slate-300" : "text-slate-600"}`}>{reasonFor(recommendation, locale)}</p><p className={`mt-3 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{t.recommendation.timing}</p><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"><form action={startReadingPractice}><input name="mode" type="hidden" value={recommendation.mode} /><input name="skill" type="hidden" value={recommendation.skill ?? ""} /><input name="subSkill" type="hidden" value={recommendation.subSkill ?? ""} /><input name="questionCount" type="hidden" value={recommendation.targetQuestionCount} /><input name="source" type="hidden" value="recommended" /><button className={`min-h-12 w-full rounded-xl px-5 py-3 font-bold sm:w-auto ${dark ? "bg-teal-400 text-slate-950" : "bg-teal-700 text-white"}`} type="submit">{recommendation.focusLevel === "mixed" ? t.recommendation.startBalanced : t.recommendation.startRecommended}</button></form><Link className={`min-h-12 rounded-xl px-5 py-3 text-center font-bold ${dark ? "border border-slate-600 text-white" : "text-teal-800"}`} href="/practice#choose-focus">{t.recommendation.chooseFocus}</Link></div></section>;
}
