import { describe, expect, it } from "vitest";
import { hasShortMockCapacity, selectShortMockQuestionIds } from "./selection";

const units = Array.from({ length: 25 }, (_, index) => ({
  id: `unit-${String(index).padStart(2, "0")}`,
  part: 5,
  questionIds: [`question-${String(index).padStart(2, "0")}`],
}));

describe("short mock selection", () => {
  it("requires a complete 20-question set", () => {
    expect(hasShortMockCapacity(units.slice(0, 19))).toBe(false);
    expect(hasShortMockCapacity(units.slice(0, 20))).toBe(true);
  });

  it("returns exactly 20 questions and pushes recent content to the end", () => {
    const result = selectShortMockQuestionIds(units, {
      seenQuestionIds: new Set(["question-00", "question-01"]),
      recentQuestionIds: new Set(["question-00"]),
    });

    expect(result).toHaveLength(20);
    expect(result).not.toContain("question-00");
    expect(result).not.toContain("question-01");
    expect(new Set(result).size).toBe(20);
  });
});
