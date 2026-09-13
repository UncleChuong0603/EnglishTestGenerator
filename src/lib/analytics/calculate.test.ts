import { describe, expect, it } from "vitest";

import { aggregatePerformance, calculateLearnerAnalytics, classifyPerformance, percentage, recentPerformance } from "./calculate";
import type { AnalyticsAttempt } from "./types";

function attempts(correct: number, total: number, overrides: Partial<AnalyticsAttempt> = {}): AnalyticsAttempt[] {
  return Array.from({ length: total }, (_, index) => ({
    isCorrect: index < correct, skill: "grammar", subSkill: "verb_tense", part: 5,
    answeredAt: new Date(Date.UTC(2026, 8, 1, 0, index)).toISOString(), sessionId: "session-a", ...overrides,
  }));
}

describe("learner analytics", () => {
  it("calculates weighted accuracy from all answers", () => {
    expect(percentage(12, 20)).toBe(60);
    expect(calculateLearnerAnalytics([...attempts(4, 10), ...attempts(8, 10)], []).overallAccuracy).toBe(60);
  });

  it("requires five attempts before learner-facing classification", () => {
    expect(classifyPerformance(0, 0)).toBe("No data");
    expect(classifyPerformance(2, 0)).toBe("Early data");
    expect(classifyPerformance(5, 49)).toBe("Needs Focus");
    expect(classifyPerformance(5, 50)).toBe("Needs Improvement");
    expect(classifyPerformance(5, 70)).toBe("Good");
    expect(classifyPerformance(5, 85)).toBe("Strong");
  });

  it("keeps Part 5, 6, and 7 answers separate", () => {
    const analytics = calculateLearnerAnalytics([
      ...attempts(5, 5, { part: 5 }), ...attempts(0, 5, { part: 6 }), ...attempts(3, 5, { part: 7 }),
    ], []);
    expect(analytics.parts.map((part) => [part.part, part.accuracy])).toEqual([[5, 100], [6, 0], [7, 60]]);
  });

  it("groups the same skill independently inside each part", () => {
    const metrics = aggregatePerformance([
      ...attempts(5, 5, { part: 5, skill: "grammar" }), ...attempts(0, 5, { part: 6, skill: "grammar" }),
    ], "skill");
    expect(metrics).toHaveLength(2);
    expect(metrics.find((metric) => metric.part === 5)?.accuracy).toBe(100);
    expect(metrics.find((metric) => metric.part === 6)?.accuracy).toBe(0);
  });

  it("calls a meaningful gain improving", () => {
    const previous = attempts(3, 5).map((attempt, index) => ({ ...attempt, answeredAt: new Date(Date.UTC(2026, 7, 1, 0, index)).toISOString() }));
    const recent = attempts(4, 5).map((attempt, index) => ({ ...attempt, answeredAt: new Date(Date.UTC(2026, 8, 1, 0, index)).toISOString() }));
    expect(recentPerformance([...previous, ...recent]).trend).toBe("Improving");
  });
});
