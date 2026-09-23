export function nextVocabularySchedule(intervalDays: number, remembered: boolean, now: Date) {
  if (!remembered) return { intervalDays: 0, dueAt: new Date(now.getTime() + 10 * 60_000) };
  const nextInterval = intervalDays === 0 ? 1 : Math.min(intervalDays * 2, 30);
  return { intervalDays: nextInterval, dueAt: new Date(now.getTime() + nextInterval * 86_400_000) };
}
