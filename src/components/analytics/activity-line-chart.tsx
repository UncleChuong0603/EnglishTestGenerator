export type ActivityTrendPoint = {
  label: string;
  signups: number;
  sessions: number;
  activeLearners: number;
};

type SeriesKey = "sessions" | "activeLearners" | "signups";

export function ActivityLineChart({ points, title, locale }: { points: ActivityTrendPoint[]; title: string; locale: "vi" | "en" }) {
  const copy = locale === "vi"
    ? { sessions: "Buổi học", learners: "Người học", signups: "Đăng ký", empty: "Chưa có hoạt động trong khoảng thời gian này" }
    : { sessions: "Sessions", learners: "Learners", signups: "Signups", empty: "No activity in this period" };
  if (points.length < 2 || points.every((point) => point.sessions + point.activeLearners + point.signups === 0)) {
    return <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">{copy.empty}</div>;
  }

  const width = 820;
  const height = 285;
  const plot = { left: 44, right: 16, top: 18, bottom: 36 };
  const plotWidth = width - plot.left - plot.right;
  const plotHeight = height - plot.top - plot.bottom;
  const max = Math.max(1, ...points.flatMap((point) => [point.sessions, point.activeLearners, point.signups]));
  const ceiling = Math.max(4, Math.ceil(max / 4) * 4);
  const x = (index: number) => plot.left + (index / Math.max(1, points.length - 1)) * plotWidth;
  const y = (value: number) => plot.top + (1 - value / ceiling) * plotHeight;
  const series: Array<{ key: SeriesKey; label: string; color: string }> = [
    { key: "sessions", label: copy.sessions, color: "var(--chart-line)" },
    { key: "activeLearners", label: copy.learners, color: "var(--chart-line-warm)" },
    { key: "signups", label: copy.signups, color: "var(--chart-line-neutral)" },
  ];
  const labelIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];

  return <figure aria-label={title}>
    <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-600" aria-hidden="true">
      {series.map((item) => <span className="inline-flex items-center gap-2" key={item.key}><span className="h-0.5 w-5 rounded-full" style={{ background: item.color }} />{item.label}</span>)}
    </div>
    <div className="overflow-x-auto pb-1">
      <svg className="h-60 min-w-[38rem] w-full" role="img" viewBox={`0 0 ${width} ${height}`}>
        <title>{title}</title>
        {[0, 1, 2, 3, 4].map((step) => {
          const value = Math.round((ceiling / 4) * step);
          return <g key={step}><line x1={plot.left} x2={width - plot.right} y1={y(value)} y2={y(value)} stroke={step === 0 ? "var(--coach-border)" : "var(--chart-grid)"} strokeDasharray={step === 0 ? undefined : "4 5"} /><text x={plot.left - 8} y={y(value) + 4} fill="var(--chart-axis)" fontSize="11" textAnchor="end">{value}</text></g>;
        })}
        {series.map((item) => <g key={item.key}>
          <polyline fill="none" points={points.map((point, index) => `${x(index)},${y(point[item.key])}`).join(" ")} stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => <circle key={`${item.key}-${point.label}`} cx={x(index)} cy={y(point[item.key])} fill="var(--surface-card)" stroke={item.color} strokeWidth="2" r="3.5"><title>{`${point.label}: ${item.label} ${point[item.key]}`}</title></circle>)}
        </g>)}
        {labelIndexes.map((index) => <text key={points[index].label} x={x(index)} y={height - 8} fill="var(--chart-axis)" fontSize="11" textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}>{points[index].label}</text>)}
      </svg>
    </div>
    <ul className="sr-only">{points.map((point) => <li key={point.label}>{point.label}: {copy.sessions} {point.sessions}, {copy.learners} {point.activeLearners}, {copy.signups} {point.signups}</li>)}</ul>
  </figure>;
}
