export type AnalyticsPeriod = "today" | "7d" | "30d";
export function periodDays(value?: string): AnalyticsPeriod { return value === "today" || value === "30d" ? value : "7d"; }
export function funnelRows(events: Record<string, number>, activated: number) {
  const counts = [events.landing_viewed ?? 0, events.try_viewed ?? 0, (events.diagnostic_started ?? 0) + (events.guest_practice_started ?? 0), (events.diagnostic_completed ?? 0) + (events.guest_practice_completed ?? 0), events.signup_completed ?? 0, activated];
  return counts.map((count, index) => ({ count, conversion: index === 0 ? 100 : counts[index - 1] ? Math.round(count / counts[index - 1] * 1000) / 10 : 0, dropoff: index === 0 ? 0 : counts[index - 1] ? Math.max(0, Math.round((1 - count / counts[index - 1]) * 1000) / 10) : 0 }));
}
