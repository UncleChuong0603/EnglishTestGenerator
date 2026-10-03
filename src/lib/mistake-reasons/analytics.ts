import type { MistakeReasonCode } from "./catalog";

export const MIN_CLASSIFIED_REASON_SAMPLE = 5;

export type MistakeReasonPattern = {
  sampleSize: number;
  top: { code: MistakeReasonCode; count: number; share: number } | null;
  sufficient: boolean;
};

export function analyzeMistakeReasonPattern(codes: readonly MistakeReasonCode[]): MistakeReasonPattern {
  const classified = codes.filter((code) => code !== "UNKNOWN");
  const counts = new Map<MistakeReasonCode, number>();
  for (const code of classified) counts.set(code, (counts.get(code) ?? 0) + 1);
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const candidate = top ? { code: top[0], count: top[1], share: top[1] / classified.length } : null;
  const sufficient = classified.length >= MIN_CLASSIFIED_REASON_SAMPLE && Boolean(candidate && candidate.count >= 3 && candidate.share >= 0.4);
  return { sampleSize: classified.length, top: sufficient ? candidate : null, sufficient };
}
