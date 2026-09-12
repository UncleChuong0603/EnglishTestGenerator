import { describe, expect, it } from "vitest";

import { aggregatePerformance, classifyPerformance, percentage } from "./calculate";

describe("learner analytics", () => {
  it("calculates weighted accuracy from attempts", () => {
    expect(percentage(12, 20)).toBe(60);
  });

  it("requires five attempts before classification", () => {
    expect(classifyPerformance(4, 0)).toBe("Not enough data");
    expect(classifyPerformance(5, 49)).toBe("Weak");
    expect(classifyPerformance(5, 50)).toBe("Needs improvement");
    expect(classifyPerformance(5, 70)).toBe("Good");
    expect(classifyPerformance(5, 85)).toBe("Strong");
  });

  it("aggregates each answer instead of averaging session percentages", () => {
    const metrics = aggregatePerformance([
      ...Array.from({ length: 10 }, (_, index) => ({ isCorrect: index < 4, skill: "Grammar", subSkill: "Tenses" })),
      ...Array.from({ length: 10 }, (_, index) => ({ isCorrect: index < 8, skill: "Grammar", subSkill: "Tenses" })),
    ], "skill");

    expect(metrics[0]).toMatchObject({ attempted: 20, correct: 12, accuracy: 60, status: "Needs improvement" });
  });
});
