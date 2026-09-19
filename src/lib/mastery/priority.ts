export const REPEATED_MISS_THRESHOLD = 2;

export type PriorityEvidence = {
  questionId: string;
  wrongCount: number;
  lastMissedAt: Date;
  lastReviewedAt: Date | null;
  reviewSuccessStreak: number;
};

/** Lexicographic ordering: repeated misses, latest miss, then review progress. */
export function compareReviewPriority(a: PriorityEvidence, b: PriorityEvidence): number {
  const repeated = Number(b.wrongCount >= REPEATED_MISS_THRESHOLD) - Number(a.wrongCount >= REPEATED_MISS_THRESHOLD);
  if (repeated) return repeated;
  const miss = b.lastMissedAt.getTime() - a.lastMissedAt.getTime();
  if (miss) return miss;
  const progress = a.reviewSuccessStreak - b.reviewSuccessStreak;
  if (progress) return progress;
  const reviewed = (a.lastReviewedAt?.getTime() ?? 0) - (b.lastReviewedAt?.getTime() ?? 0);
  return reviewed || a.questionId.localeCompare(b.questionId);
}

export function priorityReason(item: PriorityEvidence): "repeated" | "recent" | "unfinished" {
  if (item.wrongCount >= REPEATED_MISS_THRESHOLD) return "repeated";
  if (item.reviewSuccessStreak > 0) return "unfinished";
  return "recent";
}
