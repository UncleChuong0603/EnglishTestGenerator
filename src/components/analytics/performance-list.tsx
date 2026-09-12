import type { PerformanceMetric } from "@/lib/analytics/types";

const statusStyles: Record<PerformanceMetric["status"], string> = {
  "Not enough data": "bg-slate-100 text-slate-600",
  Weak: "bg-red-50 text-red-700",
  "Needs improvement": "bg-amber-50 text-amber-800",
  Good: "bg-sky-50 text-sky-700",
  Strong: "bg-emerald-50 text-emerald-700",
};

export function PerformanceList({ metrics }: { metrics: PerformanceMetric[] }) {
  return (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <div key={metric.name}>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div>
              <span className="font-bold">{metric.name}</span>
              <span className="ml-2 text-slate-500">{metric.correct}/{metric.attempted} correct</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[metric.status]}`}>{metric.status}</span>
              <span className="w-11 text-right font-black">{metric.accuracy}%</span>
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-teal-600" style={{ width: `${metric.accuracy}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
