import { PRODUCT_TIME_ZONE } from "@/lib/entitlements/catalog";

export type TrendPeriod = 7 | 30 | 90;
export type DailyAnswerCount = { day: string; answeredCount: number; correctCount: number };
export type TrendPoint = DailyAnswerCount & { accuracy: number | null };
export type PeriodComparison = { currentAccuracy: number | null; previousAccuracy: number | null; percentagePointChange: number | null };

const PRODUCT_OFFSET_MS = 7 * 60 * 60 * 1000;

export function productDay(date: Date): string {
  return new Date(date.getTime() + PRODUCT_OFFSET_MS).toISOString().slice(0, 10);
}

export function productDayStart(date: Date): Date {
  const [year, month, day] = productDay(date).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) - PRODUCT_OFFSET_MS);
}

export function buildDailyTrend(rows: DailyAnswerCount[], period: TrendPeriod, now = new Date()): TrendPoint[] {
  const end = productDayStart(now);
  const byDay = new Map(rows.map((row) => [row.day, row]));
  return Array.from({ length: period }, (_, index) => {
    const day = productDay(new Date(end.getTime() - (period - index - 1) * 86_400_000));
    const row = byDay.get(day);
    const answeredCount = row?.answeredCount ?? 0;
    const correctCount = row?.correctCount ?? 0;
    return { day, answeredCount, correctCount, accuracy: answeredCount ? Math.round(correctCount / answeredCount * 100) : null };
  });
}

export function comparePeriods(rows: DailyAnswerCount[], period: TrendPeriod, now = new Date()): PeriodComparison {
  const start = productDayStart(now).getTime();
  const boundary = productDay(new Date(start - period * 86_400_000));
  const current = rows.filter((row) => row.day > boundary);
  const previous = rows.filter((row) => row.day <= boundary);
  const accuracy = (items: DailyAnswerCount[]) => {
    const answered = items.reduce((sum, item) => sum + item.answeredCount, 0);
    const correct = items.reduce((sum, item) => sum + item.correctCount, 0);
    return answered ? Math.round(correct / answered * 100) : null;
  };
  const currentAccuracy = accuracy(current); const previousAccuracy = accuracy(previous);
  return { currentAccuracy, previousAccuracy, percentagePointChange: currentAccuracy === null || previousAccuracy === null ? null : currentAccuracy - previousAccuracy };
}

export const ANALYTICS_TIME_ZONE = PRODUCT_TIME_ZONE;
