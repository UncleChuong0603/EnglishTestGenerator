import type { MockMode } from "./blueprint";

export type PartMetric = { part: number; correct: number; answered: number; total: number; accuracy: number };
export type MockHistoryEntry = {
  runId: string; mode: MockMode; completedAt: string;
  listening: { correct: number; total: number } | null;
  reading: { correct: number; total: number } | null;
  overall: { correct: number; total: number };
  parts: PartMetric[];
};
export type MockComparison = { current: MockHistoryEntry; previous: MockHistoryEntry; overallDelta: number; listeningDelta: number | null; readingDelta: number | null; partDeltas: Array<{ part: number; delta: number }> };

export function compareCompatible(entries: MockHistoryEntry[], mode: MockMode): MockComparison | null {
  const compatible = entries.filter((entry) => entry.mode === mode).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  if (compatible.length < 2) return null;
  const [current, previous] = compatible;
  const delta = (area: "listening" | "reading") => current[area] && previous[area] ? current[area]!.correct - previous[area]!.correct : null;
  return { current, previous, overallDelta: current.overall.correct - previous.overall.correct, listeningDelta: delta("listening"), readingDelta: delta("reading"), partDeltas: current.parts.map((part) => ({ part: part.part, delta: part.correct - (previous.parts.find((old) => old.part === part.part)?.correct ?? part.correct) })) };
}

export function weakestPart(entry: MockHistoryEntry) {
  return [...entry.parts].sort((a, b) => a.accuracy - b.accuracy || a.part - b.part)[0] ?? null;
}
