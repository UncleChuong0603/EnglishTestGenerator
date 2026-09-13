import type { ReadingPart } from "./types";

export type SelectionUnit = {
  id: string;
  part: ReadingPart;
  questionIds: string[];
};

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

/** Selects whole units and stops at the closest total around the requested count. */
export function selectClosestUnits(
  units: readonly SelectionUnit[],
  target: number,
  random = Math.random,
): SelectionUnit[] {
  const candidates = shuffle(units, random);
  const selected: SelectionUnit[] = [];
  let total = 0;

  for (const unit of candidates) {
    if (total >= target) break;
    const beforeDistance = Math.abs(target - total);
    const afterDistance = Math.abs(target - (total + unit.questionIds.length));
    if (selected.length === 0 || total < target && afterDistance <= beforeDistance) {
      selected.push(unit);
      total += unit.questionIds.length;
    }
  }

  if (total < target) {
    const selectedIds = new Set(selected.map((unit) => unit.id));
    const next = candidates.find((unit) => !selectedIds.has(unit.id));
    if (next) selected.push(next);
  }
  return selected;
}

export function flattenUniqueQuestionIds(units: readonly SelectionUnit[]) {
  return [...new Set(units.flatMap((unit) => unit.questionIds))];
}

export function recommendationScore(group: {
  attempted: number;
  accuracy: number;
  recentAccuracy: number | null;
  trend: "Improving" | "Stable" | "Declining" | "Not enough data";
  availableQuestionCount: number;
}) {
  const effectiveAccuracy = group.recentAccuracy === null
    ? group.accuracy
    : group.accuracy * 0.4 + group.recentAccuracy * 0.6;
  const weakness = Math.max(0.05, 1 - effectiveAccuracy / 100);
  const confidence = Math.min(group.attempted / 20, 1);
  const trendFactor = group.trend === "Declining" ? 1.15 : group.trend === "Improving" ? 0.85 : 1;
  const availability = Math.min(group.availableQuestionCount / 15, 1);
  return weakness * confidence * trendFactor * availability;
}
