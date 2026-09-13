import type { PerformanceMetric } from "@/lib/analytics/types";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/get-translations";
import { statusLabel, taxonomyLabel } from "@/lib/i18n/labels";

const statusStyles: Record<PerformanceMetric["status"], string> = { "No data": "bg-slate-100 text-slate-600", "Early data": "bg-slate-100 text-slate-600", "Needs Focus": "bg-red-50 text-red-700", "Needs Improvement": "bg-amber-50 text-amber-800", Good: "bg-sky-50 text-sky-700", Strong: "bg-emerald-50 text-emerald-700" };
const trendStyles: Record<PerformanceMetric["trend"], string> = { Improving: "text-emerald-700", Stable: "text-slate-600", Declining: "text-red-700", "Not enough data": "text-slate-500" };

export function PerformanceList({ metrics, locale, showRecent = false }: { metrics: PerformanceMetric[]; locale: InterfaceLanguage; showRecent?: boolean }) {
  const t = getTranslations(locale);
  if (!metrics.length) return <p className="text-sm leading-6 text-slate-500">{t.progress.noData}</p>;
  return <div className="space-y-4">{metrics.map((metric) => <div key={metric.name}><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><div><span className="font-bold">{taxonomyLabel(metric.name, locale)}</span><span className="ml-2 text-slate-500">{metric.correct}/{metric.attempted} {t.progress.correct}</span></div><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[metric.status]}`}>{statusLabel(metric.status, locale)}</span><span className="w-11 text-right font-black">{metric.accuracy}%</span></div></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${metric.accuracy}%` }} /></div>{showRecent ? <p className="mt-2 text-xs text-slate-500">{t.progress.recent}: {metric.recentAccuracy === null ? "—" : `${metric.recentAccuracy}%`}<span className={`ml-2 font-bold ${trendStyles[metric.trend]}`}>{statusLabel(metric.trend, locale)}</span></p> : null}</div>)}</div>;
}
