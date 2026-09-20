import { describe, expect, it } from "vitest";
import { calculateContentSimilarity } from "./content-similarity";

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
});
