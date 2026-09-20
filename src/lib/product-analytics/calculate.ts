export type AnalyticsPeriod = "today" | "7d" | "30d";
export type ProductAnalyticsSnapshot = {
  events: Record<string, number>;
  sessions: number;
  questions: number;
  active: number;
  signups: number;
  activated: number;
  dau: number;
  wau: number;
  checkoutCreated: number;
  premiumActivated: number;
  retention: Record<string, { cohort: number; returned: number }>;
};

export type AnalyticsRecommendation = {
  key: string;
  priority: "high" | "medium" | "watch";
  confidence: "high" | "medium" | "low";
  metric: string;
  value: number;
  sample: number;
};

export function periodDays(value?: string): AnalyticsPeriod { return value === "today" || value === "30d" ? value : "7d"; }
export function funnelRows(events: Record<string, number>, activated: number) {
  const counts = [events.landing_viewed ?? 0, events.try_viewed ?? 0, (events.diagnostic_started ?? 0) + (events.guest_practice_started ?? 0), (events.diagnostic_completed ?? 0) + (events.guest_practice_completed ?? 0), events.signup_completed ?? 0, activated];
  return counts.map((count, index) => ({ count, conversion: index === 0 ? 100 : counts[index - 1] ? Math.round(count / counts[index - 1] * 1000) / 10 : 0, dropoff: index === 0 ? 0 : counts[index - 1] ? Math.max(0, Math.round((1 - count / counts[index - 1]) * 1000) / 10) : 0 }));
}

const confidenceFor = (sample: number): AnalyticsRecommendation["confidence"] => sample >= 100 ? "high" : sample >= 20 ? "medium" : "low";

export function analyticsRecommendations(data: ProductAnalyticsSnapshot): AnalyticsRecommendation[] {
  const funnel = funnelRows(data.events, data.activated);
  const funnelKeys = ["landing_to_try", "try_to_start", "start_to_complete", "complete_to_signup", "signup_to_activation"];
  const candidates: AnalyticsRecommendation[] = funnel.slice(1).flatMap((row, index) => {
    const sample = funnel[index].count;
    if (!sample) return [];
    return [{ key: funnelKeys[index], priority: row.dropoff >= 70 ? "high" : row.dropoff >= 45 ? "medium" : "watch", confidence: confidenceFor(sample), metric: "dropoff", value: row.dropoff, sample }];
  });
  for (const day of [1, 7, 30]) {
    const retention = data.retention[String(day)] ?? { cohort: 0, returned: 0 };
    if (!retention.cohort) continue;
    const value = Math.round(retention.returned / retention.cohort * 1000) / 10;
    const threshold = day === 1 ? 25 : day === 7 ? 12 : 6;
    candidates.push({ key: `retention_d${day}`, priority: value < threshold / 2 ? "high" : value < threshold ? "medium" : "watch", confidence: confidenceFor(retention.cohort), metric: "retention", value, sample: retention.cohort });
  }
  const pricingViews = data.events.pricing_viewed ?? 0;
  if (pricingViews) {
    const value = Math.round(data.checkoutCreated / pricingViews * 1000) / 10;
    candidates.push({ key: "pricing_to_checkout", priority: value < 2 ? "high" : value < 5 ? "medium" : "watch", confidence: confidenceFor(pricingViews), metric: "conversion", value, sample: pricingViews });
  }
  const rank = { high: 0, medium: 1, watch: 2 } as const;
  const confidenceRank = { high: 0, medium: 1, low: 2 } as const;
  return candidates.sort((a, b) => rank[a.priority] - rank[b.priority] || confidenceRank[a.confidence] - confidenceRank[b.confidence] || b.sample - a.sample).slice(0, 5);
}

function csvCell(value: string | number) { const text = String(value); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }

export function productAnalyticsCsv(data: ProductAnalyticsSnapshot, period: AnalyticsPeriod, generatedAt: string) {
  const rows: Array<Array<string | number>> = [["section", "metric", "value", "sample", "period", "generated_at"]];
  const add = (section: string, metric: string, value: string | number, sample: string | number = "") => rows.push([section, metric, value, sample, period, generatedAt]);
  add("overview", "signups", data.signups); add("overview", "activated", data.activated); add("overview", "dau", data.dau); add("overview", "wau", data.wau); add("overview", "completed_sessions", data.sessions); add("overview", "questions_practiced", data.questions); add("overview", "active_learners", data.active);
  for (const [event, value] of Object.entries(data.events).sort(([a], [b]) => a.localeCompare(b))) add("event", event, value);
  funnelRows(data.events, data.activated).forEach((row, index) => { add("funnel_count", String(index + 1), row.count); add("funnel_conversion_pct", String(index + 1), row.conversion, index ? funnelRows(data.events, data.activated)[index - 1].count : row.count); add("funnel_dropoff_pct", String(index + 1), row.dropoff, index ? funnelRows(data.events, data.activated)[index - 1].count : row.count); });
  add("premium", "checkout_created", data.checkoutCreated); add("premium", "premium_activated", data.premiumActivated);
  for (const day of [1, 7, 30]) { const value = data.retention[String(day)] ?? { cohort: 0, returned: 0 }; add("retention", `d${day}_returned`, value.returned, value.cohort); add("retention", `d${day}_rate_pct`, value.cohort ? Math.round(value.returned / value.cohort * 1000) / 10 : 0, value.cohort); }
  for (const item of analyticsRecommendations(data)) add("recommendation", item.key, item.value, item.sample);
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}
