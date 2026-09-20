import type { TrendPoint } from "@/lib/progress/trends";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function UsageProgress({ label, used, limit, period }: { label: string; used: number; limit: number; period: string }) {
  const percent = Math.min(100, Math.round(used / limit * 100));
  return <div className="min-w-0 rounded-xl bg-slate-50 p-3 sm:p-4"><div className="flex flex-wrap items-baseline justify-between gap-x-2"><strong className="min-w-0 break-words text-sm">{label}</strong><span className="whitespace-nowrap text-sm font-bold">{used} / {limit}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={`${label}: ${used} / ${limit} ${period}`} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.min(used, limit)}><div className="h-full rounded-full bg-teal-600" style={{ width: `${percent}%` }} /></div><p className="mt-1 text-xs text-slate-500">{period}</p></div>;
}

export function AccuracyDonut({ correct, total, label }: { correct: number; total: number; label: string }) {
  const accuracy = total ? Math.round(correct / total * 100) : null;
  if (accuracy === null) return <ChartEmptyState />;
  return <div className="flex items-center gap-5" role="img" aria-label={`${label}: ${accuracy}%, ${correct}/${total}`}><div className="grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#0d9488 ${accuracy}%, #e2e8f0 0)` }}><div className="grid size-20 place-items-center rounded-full bg-white text-xl font-black">{accuracy}%</div></div><div><p className="font-black">{label}</p><p className="mt-1 text-sm text-slate-600">{correct}/{total}</p></div></div>;
}

export type ComparisonItem = { label: string; accuracy: number | null; answered: number; correct?: number };
export function ComparisonBars({ items, noData = "Chưa có dữ liệu", unit = "" }: { items: ComparisonItem[]; noData?: string; unit?: string }) {
  const count = (value: number) => `${value}${unit ? ` ${unit}` : ""}`;
  return <div className="space-y-4">{items.map((item) => <div key={item.label}><div className="flex items-end justify-between gap-3"><strong>{item.label}</strong><span className="text-sm font-semibold text-slate-600">{item.accuracy === null ? noData : `${item.accuracy}% · ${count(item.answered)}`}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${item.label}: ${item.accuracy === null ? noData : `${item.accuracy}%, ${count(item.answered)}`}`}><div className="h-full rounded-full bg-teal-600" style={{ width: `${item.accuracy ?? 0}%` }} /></div></div>)}</div>;
}

function formatChartDay(day: string, locale: InterfaceLanguage, includeYear = false) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

export function TrendChart({ points, title, emptyText, locale = "en" }: { points: TrendPoint[]; title: string; emptyText: string; locale?: InterfaceLanguage }) {
  const active = points.filter((point) => point.accuracy !== null);
  if (active.length < 2) return <ChartEmptyState text={emptyText} />;

  const width = 720;
  const height = 248;
  const plot = { left: 42, right: 12, top: 18, bottom: 32 };
  const plotWidth = width - plot.left - plot.right;
  const plotHeight = height - plot.top - plot.bottom;
  const x = (index: number) => plot.left + (index / Math.max(points.length - 1, 1)) * plotWidth;
  const y = (accuracy: number) => plot.top + ((100 - accuracy) / 100) * plotHeight;
  const maxAnswered = Math.max(...points.map((point) => point.answeredCount), 1);
  const barWidth = Math.max(3, Math.min(24, (plotWidth / points.length) * 0.46));
  const segments: TrendPoint[][] = [];
  for (const point of points) {
    if (point.accuracy === null) continue;
    const previous = segments.at(-1)?.at(-1);
    if (previous && points.indexOf(point) === points.indexOf(previous) + 1) segments.at(-1)!.push(point);
    else segments.push([point]);
  }
  const copy = locale === "vi"
    ? { accuracy: "Độ chính xác", volume: "Số câu trả lời", questions: "câu", noActivity: "Không có hoạt động" }
    : { accuracy: "Accuracy", volume: "Answers", questions: "questions", noActivity: "No activity" };
  const labelIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];

  return <figure aria-label={title}>
    <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600" aria-hidden="true">
      <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 rounded-full bg-teal-600" />{copy.accuracy}</span>
      <span className="inline-flex items-center gap-2"><span className="h-3 w-2.5 rounded-sm bg-teal-100 ring-1 ring-inset ring-teal-200" />{copy.volume}</span>
    </div>
    <div className="overflow-x-auto pb-1">
      <svg className="h-52 min-w-[34rem] w-full" role="img" viewBox={`0 0 ${width} ${height}`}>
        <title>{title}</title>
        {[100, 75, 50, 25, 0].map((tick) => <g key={tick}>
          <line x1={plot.left} x2={width - plot.right} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? "#cbd5e1" : "#e2e8f0"} strokeDasharray={tick === 0 ? undefined : "4 5"} />
          <text x={plot.left - 8} y={y(tick) + 4} fill="#64748b" fontSize="11" textAnchor="end">{tick}%</text>
        </g>)}
        {points.map((point, index) => {
          if (!point.answeredCount) return null;
          const barHeight = Math.max(5, (point.answeredCount / maxAnswered) * (plotHeight * 0.42));
          return <rect key={`bar-${point.day}`} x={x(index) - barWidth / 2} y={plot.top + plotHeight - barHeight} width={barWidth} height={barHeight} rx="3" fill="#ccfbf1" stroke="#99f6e4"><title>{formatChartDay(point.day, locale, true)}: {point.answeredCount} {copy.questions}</title></rect>;
        })}
        {segments.filter((segment) => segment.length > 1).map((segment) => <polyline key={segment[0].day} fill="none" points={segment.map((point) => `${x(points.indexOf(point))},${y(point.accuracy!)}`).join(" ")} stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />)}
        {active.map((point) => <circle key={point.day} cx={x(points.indexOf(point))} cy={y(point.accuracy!)} fill="#ffffff" stroke="#0f766e" strokeWidth="3" r="5"><title>{formatChartDay(point.day, locale, true)}: {point.accuracy}% · {point.answeredCount} {copy.questions}</title></circle>)}
        {labelIndexes.map((index) => <text key={points[index].day} x={x(index)} y={height - 7} fill="#64748b" fontSize="11" textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}>{formatChartDay(points[index].day, locale)}</text>)}
      </svg>
    </div>
    <figcaption className="mt-1 text-xs leading-5 text-slate-500">
      {locale === "vi" ? "Đường chỉ nối các ngày học liên tiếp; ngày không học được để trống." : "The line connects consecutive learning days only; inactive days remain blank."}
    </figcaption>
    <ul className="sr-only">{points.map((point) => <li key={point.day}>{formatChartDay(point.day, locale, true)}: {point.accuracy === null ? copy.noActivity : `${point.accuracy}% ${copy.accuracy.toLowerCase()}, ${point.answeredCount} ${copy.questions}`}</li>)}</ul>
  </figure>;
}

export function ChartEmptyState({ text = "Chưa có dữ liệu" }: { text?: string }) { return <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">{text}</div>; }
