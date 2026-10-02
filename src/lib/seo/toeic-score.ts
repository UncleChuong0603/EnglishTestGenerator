export type ToeicScoreSummary = {
  total: number;
  gap: number;
  reachedTarget: boolean;
};

export function summarizeToeicScore(listening: number, reading: number, target: number): ToeicScoreSummary | null {
  if (![listening, reading, target].every(Number.isInteger)) return null;
  if (listening < 5 || listening > 495 || reading < 5 || reading > 495 || target < 10 || target > 990) return null;
  const total = listening + reading;
  return { total, gap: Math.max(0, target - total), reachedTarget: total >= target };
}
