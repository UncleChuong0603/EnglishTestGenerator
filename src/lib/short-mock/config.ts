import type { PracticeSource } from "@/lib/practice/types";

export const SHORT_MOCK_QUESTION_COUNT = 20;
export const SHORT_MOCK_PART = 5 as const;

export const SHORT_MOCK_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type ShortMockDifficulty = (typeof SHORT_MOCK_DIFFICULTIES)[number];
export type ShortMockSource = `short_mock_${ShortMockDifficulty}`;

export function isShortMockDifficulty(value: unknown): value is ShortMockDifficulty {
  return typeof value === "string" && SHORT_MOCK_DIFFICULTIES.includes(value as ShortMockDifficulty);
}

export function shortMockSource(difficulty: ShortMockDifficulty): ShortMockSource {
  return `short_mock_${difficulty}`;
}

export function shortMockDifficultyFromSource(source: PracticeSource | string): ShortMockDifficulty | null {
  const difficulty = source.startsWith("short_mock_") ? source.slice("short_mock_".length) : "";
  return isShortMockDifficulty(difficulty) ? difficulty : null;
}
