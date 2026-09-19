import type { TrendPoint } from "@/lib/progress/trends";

export function UsageProgress({ label, used, limit, period }: { label: string; used: number; limit: number; period: string }) {
  const percent = Math.min(100, Math.round(used / limit * 100));
  return <div className="rounded-xl bg-slate-50 p-4"><div className="flex items-baseline justify-between gap-3"><strong>{label}</strong><span className="text-sm font-bold">{used} / {limit}</span></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={`${label}: ${used} / ${limit} ${period}`} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.min(used, limit)}><div className="h-full rounded-full bg-teal-600" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs text-slate-500">{period}</p></div>;
}

export function AccuracyDonut({ correct, total, label }: { correct: number; total: number; label: string }) {
  const accuracy = total ? Math.round(correct / total * 100) : null;
  if (accuracy === null) return <ChartEmptyState />;
  return <div className="flex items-center gap-5" role="img" aria-label={`${label}: ${accuracy}%, ${correct}/${total}`}><div className="grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#0d9488 ${accuracy}%, #e2e8f0 0)` }}><div className="grid size-20 place-items-center rounded-full bg-white text-xl font-black">{accuracy}%</div></div><div><p className="font-black">{label}</p><p className="mt-1 text-sm text-slate-600">{correct}/{total}</p></div></div>;
}

export type ComparisonItem = { label: string; accuracy: number | null; answered: number; correct?: number };
export function ComparisonBars({ items, noData = "Chưa có dữ liệu" }: { items: ComparisonItem[]; noData?: string }) {
  return <div className="space-y-4">{items.map((item) => <div key={item.label}><div className="flex items-end justify-between gap-3"><strong>{item.label}</strong><span className="text-sm font-semibold text-slate-600">{item.accuracy === null ? noData : `${item.accuracy}% · ${item.answered} câu`}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${item.label}: ${item.accuracy === null ? noData : `${item.accuracy}%, ${item.answered} câu`}`}><div className="h-full rounded-full bg-teal-600" style={{ width: `${item.accuracy ?? 0}%` }} /></div></div>)}</div>;
}

export function TrendChart({ points, title, emptyText }: { points: TrendPoint[]; title: string; emptyText: string }) {
  const active = points.filter((point) => point.accuracy !== null);
  if (active.length < 2) return <ChartEmptyState text={emptyText} />;
  const coords = active.map((point) => { const index = points.indexOf(point); return `${(index / (points.length - 1)) * 100},${100 - point.accuracy!}`; }).join(" ");
  return <figure><svg aria-label={title} className="h-44 w-full overflow-visible" role="img" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="0" x2="100" y1="100" y2="100" stroke="#cbd5e1" vectorEffect="non-scaling-stroke"/><line x1="0" x2="100" y1="50" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" vectorEffect="non-scaling-stroke"/><polyline fill="none" points={coords} stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>{active.map((point) => { const index = points.indexOf(point); return <circle key={point.day} cx={(index / (points.length - 1)) * 100} cy={100 - point.accuracy!} fill="#0f766e" r="1.8"><title>{point.day}: {point.accuracy}% ({point.answeredCount} câu)</title></circle>; })}</svg><figcaption className="mt-3 flex justify-between text-xs text-slate-500"><span>{points[0].day}</span><span>{points.at(-1)?.day}</span></figcaption><ul className="sr-only">{active.map((point) => <li key={point.day}>{point.day}: {point.accuracy}% trên {point.answeredCount} câu</li>)}</ul></figure>;
}

export function ChartEmptyState({ text = "Chưa có dữ liệu" }: { text?: string }) { return <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">{text}</div>; }
