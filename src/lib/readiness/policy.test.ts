import { describe, expect, it } from "vitest";
import { calculateToeicProgress } from "@/lib/progress/calculate";
import type { ProgressAggregateRow } from "@/lib/progress/types";
import { buildExamReadiness, evidenceState, type ReadinessFacts } from "./policy";

function progress(listening = { answered: 0, correct: 0 }, reading = { answered: 0, correct: 0 }) {
  const rows: ProgressAggregateRow[] = [];
  if (listening.answered) rows.push({ skillArea: "LISTENING", part: 2, skill: "respond_to_questions", subskill: "detail", attemptedCount: listening.answered, correctCount: listening.correct, latestAttemptAt: "2026-10-03T00:00:00.000Z" });
  if (reading.answered) rows.push({ skillArea: "READING", part: 5, skill: "grammar", subskill: "verbs", attemptedCount: reading.answered, correctCount: reading.correct, latestAttemptAt: "2026-10-03T00:00:00.000Z" });
  return calculateToeicProgress(rows);
}

function facts(overrides: Partial<ReadinessFacts> = {}): ReadinessFacts {
  return {
    now: new Date("2026-10-04T05:00:00.000Z"),
    goal: null,
    progress: progress(),
    learningDays28: 0,
    diagnosticCompletedAt: null,
    unresolvedMistakes: 0,
    masteredMistakes: 0,
    weeklyPlan: { planned: 0, completed: 0 },
    mocks: { completed: 0, latestCompletedAt: null },
    plan: "FREE",
    mockQuotaReached: false,
    ...overrides,
  };
}

describe("exam readiness evidence policy", () => {
  it("uses insufficient-data states and a useful diagnostic action with no history", () => {
    const result = buildExamReadiness(facts());
    expect(result.listening.state).toBe("INSUFFICIENT_DATA");
    expect(result.reading.state).toBe("INSUFFICIENT_DATA");
    expect(result.consistency.state).toBe("INSUFFICIENT_DATA");
    expect(result.actions[0]).toEqual({ code: "TAKE_DIAGNOSTIC", href: "/diagnostic" });
    expect(result).not.toHaveProperty("predictedScore");
    expect(result).not.toHaveProperty("readinessPercentage");
    expect(result).not.toHaveProperty("targetProbability");
  });

  it("does not label a small perfect sample strong", () => {
    expect(evidenceState({ attemptedCount: 19, accuracy: 100 })).toBe("INSUFFICIENT_DATA");
    expect(evidenceState({ attemptedCount: 20, accuracy: 100 })).toBe("STABLE");
    expect(evidenceState({ attemptedCount: 49, accuracy: 90 })).toBe("STABLE");
    expect(evidenceState({ attemptedCount: 50, accuracy: 86 })).toBe("STRONG");
  });

  it("classifies partial evidence without inventing an overall score", () => {
    const result = buildExamReadiness(facts({ progress: progress({ answered: 24, correct: 13 }, { answered: 8, correct: 8 }), learningDays28: 5 }));
    expect(result.listening.state).toBe("NEEDS_WORK");
    expect(result.reading.state).toBe("INSUFFICIENT_DATA");
    expect(result.priorities[0]).toMatchObject({ part: 2, answered: 24, correct: 13 });
  });

  it("reports goal and exam date as context, not as a prediction", () => {
    const result = buildExamReadiness(facts({ goal: { targetScore: 750, examDate: "2026-10-19", dailyStudyMinutes: 30, studyDaysPerWeek: 5, updatedAt: "2026-10-01T00:00:00.000Z" }, learningDays28: 17 }));
    expect(result.goal).toEqual({ targetScore: 750, examDate: "2026-10-19", daysUntilExam: 15 });
    expect(result.consistency).toMatchObject({ state: "STRONG", targetDays28: 20 });
  });

  it("recommends a mock only after completed diagnostic and stable evidence in both areas", () => {
    const notReady = buildExamReadiness(facts({ progress: progress({ answered: 60, correct: 52 }, { answered: 60, correct: 51 }) }));
    expect(notReady.mocks.recommended).toBe(false);
    const ready = buildExamReadiness(facts({ progress: progress({ answered: 60, correct: 52 }, { answered: 60, correct: 51 }), diagnosticCompletedAt: "2026-09-30T00:00:00.000Z", mocks: { completed: 1, latestCompletedAt: "2026-10-01T00:00:00.000Z" } }));
    expect(ready.mocks).toMatchObject({ recommended: true, completed: 1 });
    expect(ready.actions).toContainEqual({ code: "TAKE_FULL_MOCK", href: "/full-mock" });
  });

  it("keeps evidence states identical for Free and Premium and exposes only a reached mock limit", () => {
    const shared = { progress: progress({ answered: 60, correct: 52 }, { answered: 60, correct: 51 }), diagnosticCompletedAt: "2026-09-30T00:00:00.000Z" } satisfies Partial<ReadinessFacts>;
    const free = buildExamReadiness(facts({ ...shared, plan: "FREE", mockQuotaReached: true }));
    const premium = buildExamReadiness(facts({ ...shared, plan: "PREMIUM", mockQuotaReached: false }));
    expect([free.listening.state, free.reading.state]).toEqual([premium.listening.state, premium.reading.state]);
    expect(free.mocks.access).toBe("QUOTA_REACHED");
    expect(premium.mocks.access).toBe("AVAILABLE");
  });

  it("uses real Weekly Plan completion counts", () => {
    const partial = buildExamReadiness(facts({ weeklyPlan: { planned: 5, completed: 3 } }));
    expect(partial.weeklyPlan).toEqual({ state: "STABLE", planned: 5, completed: 3 });
    expect(partial.actions).toContainEqual({ code: "CONTINUE_WEEKLY_PLAN", href: "/dashboard#weekly-plan-heading" });
    expect(buildExamReadiness(facts({ weeklyPlan: { planned: 3, completed: 3 } })).weeklyPlan.state).toBe("STRONG");
  });
});
