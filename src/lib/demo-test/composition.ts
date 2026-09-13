import type { DemoSelectionUnit } from "./types";

export const DEMO_PART_COUNTS = { 5: 30, 6: 16, 7: 54 } as const;
export const DEMO_QUESTION_COUNT = 100;
export const DEMO_DURATION_SECONDS = 75 * 60;

/** Exact subset-sum selection. It never splits a passage set or depends on retry luck. */
export function selectExactUnits(units: readonly DemoSelectionUnit[], target: number) {
  const reachable = new Map<number, DemoSelectionUnit[]>([[0, []]]);
  for (const unit of units) {
    const snapshot = [...reachable.entries()].sort(([a], [b]) => b - a);
    for (const [sum, chosen] of snapshot) {
      const next = sum + unit.questionIds.length;
      if (next <= target && !reachable.has(next)) reachable.set(next, [...chosen, unit]);
    }
  }
  return reachable.get(target) ?? null;
}

export function validateDemoComposition(units: readonly DemoSelectionUnit[]) {
  const ids = units.flatMap((unit) => unit.questionIds);
  const counts = { 5: 0, 6: 0, 7: 0 };
  for (const unit of units) counts[unit.part] += unit.questionIds.length;
  return ids.length === DEMO_QUESTION_COUNT
    && new Set(ids).size === DEMO_QUESTION_COUNT
    && counts[5] === DEMO_PART_COUNTS[5]
    && counts[6] === DEMO_PART_COUNTS[6]
    && counts[7] === DEMO_PART_COUNTS[7]
    && units.every((unit) => unit.part === 5 ? unit.questionIds.length === 1 : unit.questionIds.length > 0);
}

export function remainingSeconds(expiresAt: string, nowMs = Date.now()) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - nowMs) / 1000));
}

export function formatTimer(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

