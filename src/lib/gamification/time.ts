import { GAMIFICATION_CATALOG } from "./catalog";
const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: GAMIFICATION_CATALOG.timezone, year: "numeric", month: "2-digit", day: "2-digit" });
export function getVietnamLocalDate(now = new Date()) { return dateFormatter.format(now); }
export function addLocalDays(date: string, days: number) { const [y,m,d] = date.split("-").map(Number); return new Date(Date.UTC(y,m-1,d+days)).toISOString().slice(0,10); }
export function getWeeklyRankingWindow(now = new Date()) {
  const localDate = getVietnamLocalDate(now); const [y,m,d] = localDate.split("-").map(Number); const weekday = new Date(Date.UTC(y,m-1,d)).getUTCDay();
  const startDate = addLocalDays(localDate, -((weekday + 6) % 7)); const endDate = addLocalDays(startDate, 7);
  return { startDate, endDate, start: new Date(`${startDate}T00:00:00+07:00`), end: new Date(`${endDate}T00:00:00+07:00`) };
}
export function previousWeeklyRankingWindow(now = new Date()) { const current = getWeeklyRankingWindow(now); return getWeeklyRankingWindow(new Date(current.start.getTime() - 1)); }
