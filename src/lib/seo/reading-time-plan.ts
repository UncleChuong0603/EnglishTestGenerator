export const READING_MINUTES = 75;

export function readingTimePlan(part5: number, part6: number, review: number) {
  if (![part5, part6, review].every(Number.isInteger) || part5 < 1 || part6 < 1 || review < 0
    || part5 + part6 + review >= READING_MINUTES) return null;
  const part7 = READING_MINUTES - part5 - part6 - review;
  return {
    part5, part6, part7, review,
    checkpoints: [
      { part: "Part 5", minutes: part5, remaining: READING_MINUTES - part5 },
      { part: "Part 6", minutes: part6, remaining: READING_MINUTES - part5 - part6 },
      { part: "Part 7", minutes: part7, remaining: review },
      { part: "review", minutes: review, remaining: 0 },
    ],
  };
}
