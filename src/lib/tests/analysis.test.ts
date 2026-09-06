import { describe, expect, it } from "vitest";
import { aggregateSkills, calculateScore, getPerformanceInsights } from "./analysis";

const answers = [
  { questionId: "1", skill: "vocabulary" as const, correctAnswer: "A" as const, selectedAnswer: "A" as const },
  { questionId: "2", skill: "vocabulary" as const, correctAnswer: "B" as const, selectedAnswer: "B" as const },
  { questionId: "3", skill: "inference" as const, correctAnswer: "C" as const, selectedAnswer: "A" as const },
  { questionId: "4", skill: "inference" as const, correctAnswer: "D" as const, selectedAnswer: null },
];

describe("reading analysis", () => {
  it("scores answers deterministically", () => {
    expect(calculateScore(answers)).toEqual({ correct: 2, total: 4, percent: 50 });
  });

  it("aggregates skills and recommends the lowest area", () => {
    const results = aggregateSkills(answers);
    expect(results).toEqual([
      { skill: "vocabulary", correct: 2, total: 2, percent: 100 },
      { skill: "inference", correct: 0, total: 2, percent: 0 },
    ]);
    expect(getPerformanceInsights(results).recommendation.skill).toBe("inference");
  });
});
