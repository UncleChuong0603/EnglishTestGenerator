import { describe, expect, it } from "vitest";
import { compareReviewPriority, priorityReason, REPEATED_MISS_THRESHOLD, type PriorityEvidence } from "./priority";

const date = (day: number) => new Date(`2026-09-${String(day).padStart(2, "0")}T00:00:00Z`);
const item = (questionId: string, changes: Partial<PriorityEvidence> = {}): PriorityEvidence => ({
  questionId, wrongCount: 1, lastMissedAt: date(10), lastReviewedAt: null, reviewSuccessStreak: 0, ...changes,
});

describe("smart review priority", () => {
  it("prioritizes repeated misses, then newer misses, then lower review progress", () => {
    const input = [item("progress", { reviewSuccessStreak: 1 }), item("old", { lastMissedAt: date(1) }), item("repeat", { wrongCount: 3, lastMissedAt: date(1) }), item("recent")];
    expect(input.sort(compareReviewPriority).map((value) => value.questionId)).toEqual(["repeat", "recent", "progress", "old"]);
  });
  it("uses oldest review and ID as stable tie breakers", () => {
    const input = [item("b", { lastReviewedAt: date(9) }), item("c"), item("a")];
    expect(input.sort(compareReviewPriority).map((value) => value.questionId)).toEqual(["a", "c", "b"]);
  });
  it("defines repeated misses from wrong answers, not review attempts", () => {
    expect(REPEATED_MISS_THRESHOLD).toBe(2);
    expect(priorityReason(item("one", { wrongCount: 1 }))).not.toBe("repeated");
    expect(priorityReason(item("two", { wrongCount: 2 }))).toBe("repeated");
  });
});
