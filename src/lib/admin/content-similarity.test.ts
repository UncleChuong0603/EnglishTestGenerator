import { describe, expect, it } from "vitest";
import { calculateContentSimilarity, calculatePreparedSimilarity, prepareContentSimilarity } from "./content-similarity";

describe("content similarity", () => {
  it("scores duplicated questions much higher than unrelated questions", () => {
    const original = "When will the marketing team submit the quarterly report? A On Friday afternoon B In the blue folder C By train D With Ms Lane";
    const duplicate = "When will the marketing team submit its quarterly report? A Friday afternoon B Inside the blue folder C By train D With Ms. Lane";
    const unrelated = "Where should visitors leave their umbrellas? A Beside the reception desk B At nine o'clock C A software update D Two tickets";
    expect(calculateContentSimilarity(original, duplicate)).toBeGreaterThan(0.6);
    expect(calculateContentSimilarity(original, unrelated)).toBeLessThan(0.25);
  });

  it("normalizes punctuation and repeated whitespace", () => {
    expect(calculateContentSimilarity("The invoice is ready!", "  The invoice is ready. ")).toBe(1);
  });

  it("reuses prepared weights without changing scores or mutating inputs", () => {
    const left = prepareContentSimilarity("The marketing team submits monthly reports.");
    const right = prepareContentSimilarity("The marketing team submits quarterly reports.");
    const before = [...left.weights.entries()];
    expect(calculatePreparedSimilarity(left, right)).toBe(calculateContentSimilarity("The marketing team submits monthly reports.", "The marketing team submits quarterly reports."));
    expect(calculatePreparedSimilarity(left, right)).toBe(calculatePreparedSimilarity(right, left));
    expect([...left.weights.entries()]).toEqual(before);
    expect(calculatePreparedSimilarity(prepareContentSimilarity(""), prepareContentSimilarity(""))).toBe(0);
  });
});
