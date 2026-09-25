import { describe, expect, it } from "vitest";
import { buildWeeklyReview, type ReviewFacts } from "./policy";
import { buildWeeklyPlan, productWeekWindow } from "@/lib/weekly-plan/policy";
import type { GoalProfile } from "@/lib/goals/domain";

const fact = (overrides: Partial<ReviewFacts> = {}): ReviewFacts => ({
  weekStart: "2026-09-14", learningDays: 0, completedSessions: 0, answered: 0, correct: 0,
  activities: {}, breakdown: [], unresolvedMistakes: 0, repeatedMistakes: 0, masteredMistakes: 0, plannedActivities: null, ...overrides,
});
const goal = (days: 3 | 5 | 7): GoalProfile => ({ targetScore: null, examDate: null, dailyStudyMinutes: 20, studyDaysPerWeek: days, updatedAt: "2026-09-21T00:00:00Z" });
const planInput = { now: new Date("2026-09-21T00:00:00Z"), goal: null as GoalProfile | null, plan: "PREMIUM" as const,
  recommendation: null, reviewableMistakes: 0, repeatedMistakes: 0, recommendedReady: false,
  readingReady: true, focusedReadingReady: false, listeningReady: true, mockListeningReady: false,
  workoutAvailable: true, reviewAvailable: true, manualAvailable: true, mockAvailable: false,
  learningDays: 0, completedActivities: 0 };

describe("weekly review and adjustment", () => {
  it("does not invent a review or plan completion without previous activity", () => {
    const review = buildWeeklyReview(fact(), null);
    expect(review.hasActivity).toBe(false);
    expect(review.planCompletion).toBeNull();
    expect(review.comparison).toBeNull();
    expect(review.focus).toEqual([]);
  });
  it("uses real partial activity but keeps small samples neutral", () => {
    const review = buildWeeklyReview(fact({ answered: 4, correct: 2, learningDays: 1, completedSessions: 1, activities: { READING: 1 },
      breakdown: [{ part: 5, skill: "Grammar", subskill: "Word Form", answered: 4, correct: 2 }] }), fact({ answered: 10, correct: 8 }));
    expect(review.accuracy).toBe(50);
    expect(review.parts).toEqual([]);
    expect(review.weakness).toBeNull();
    expect(review.comparison).toBeNull();
    expect(review.planCompletion).toBeNull();
  });
  it("counts saved slots once and compares only two supported weeks", () => {
    const review = buildWeeklyReview(fact({ answered: 10, correct: 5, learningDays: 2, completedSessions: 2,
      activities: { READING: 2 }, plannedActivities: ["READING", "READING", "REVIEW"],
      breakdown: [{ part: 5, skill: "Grammar", subskill: "Word Form", answered: 10, correct: 5 }], repeatedMistakes: 2, unresolvedMistakes: 2 }),
      fact({ answered: 8, correct: 3, learningDays: 1 }));
    expect(review.planCompletion).toEqual({ completed: 2, planned: 3, missed: ["REVIEW"] });
    expect(review.weakness?.part).toBe(5);
    expect(review.comparison).toEqual({ questionDelta: 2, accuracyDelta: 12, learningDayDelta: 1 });
    expect(review.focus).toEqual(["review_repeated", "part_5"]);
  });
  it.each([3, 5, 7] as const)("keeps %i slots and never raises capacity from low activity", days => {
    const review = buildWeeklyReview(fact({ answered: 10, correct: 8, learningDays: 1, completedSessions: 1, activities: { READING: 1 } }), null);
    const plan = buildWeeklyPlan({ ...planInput, goal: goal(days), review });
    expect(plan.items).toHaveLength(days);
    expect(plan.studyMinutes).toBe(20);
    expect(plan.adjustmentReasons).toContain("keep_capacity");
  });
  it("prioritizes repeated mistakes and honors exhausted quota", () => {
    const review = buildWeeklyReview(fact({ answered: 10, correct: 6, learningDays: 2, completedSessions: 1, repeatedMistakes: 2, unresolvedMistakes: 2 }), null);
    const plan = buildWeeklyPlan({ ...planInput, review, reviewableMistakes: 2, repeatedMistakes: 2, reviewAvailable: false });
    expect(plan.items[0]).toMatchObject({ activity: "REVIEW", available: false });
    expect(plan.adjustmentReasons).toContain("repeated_mistakes");
  });
  it("does not add a mock without readiness and does not keep mastered reviews", () => {
    const review = buildWeeklyReview(fact({ answered: 10, correct: 9, completedSessions: 1, masteredMistakes: 2 }), null);
    const plan = buildWeeklyPlan({ ...planInput, review, goal: { ...goal(5), dailyStudyMinutes: 45 }, mockListeningReady: false, reviewableMistakes: 0 });
    expect(plan.items.some(item => item.activity === "MOCK_LISTENING" || item.activity === "REVIEW")).toBe(false);
    expect(plan.adjustmentReasons).toContain("mastered_review");
  });
  it("changes product week exactly at Monday 00:00 Vietnam time", () => {
    expect(productWeekWindow(new Date("2026-09-20T16:59:59Z")).start.toISOString()).toBe("2026-09-13T17:00:00.000Z");
    expect(productWeekWindow(new Date("2026-09-20T17:00:00Z")).start.toISOString()).toBe("2026-09-20T17:00:00.000Z");
    const review = buildWeeklyReview(fact({ answered: 10, correct: 8, completedSessions: 1 }), null);
    expect(buildWeeklyPlan({ ...planInput, review }).items.map(item => item.activity)).toEqual(buildWeeklyPlan({ ...planInput, review }).items.map(item => item.activity));
  });
});
