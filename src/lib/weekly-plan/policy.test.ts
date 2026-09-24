import { describe, expect, it } from "vitest";
import type { GoalProfile } from "@/lib/goals/domain";
import type { WorkoutRecommendation } from "@/lib/diagnosis/types";
import { buildWeeklyPlan, productWeekStart, productWeekWindow } from "./policy";

const recommendation: WorkoutRecommendation = {
  kind: "EXPLORATION", skillArea: "READING", part: 5, primarySkill: null, primarySubskill: null,
  requestedQuestionCount: 10, questionCount: 10, groupCount: null,
  selectionMix: { primary: 60, support: 20, maintenance: 20 }, reasonCode: "BUILD_PROFILE", evidence: null,
};
const goal = (days: 3 | 5 | 7, minutes: 10 | 20 | 30 | 45 | 60): GoalProfile => ({
  targetScore: 750, examDate: "2026-12-20", studyDaysPerWeek: days, dailyStudyMinutes: minutes, updatedAt: "2026-09-21T00:00:00Z",
});
const input = { now: new Date("2026-09-24T17:30:00Z"), goal: null as GoalProfile | null, plan: "FREE" as const,
  recommendation, reviewableMistakes: 0, repeatedMistakes: 0, recommendedReady: true, readingReady: true, focusedReadingReady: false, listeningReady: true, mockListeningReady: true,
  workoutAvailable: true, reviewAvailable: true, manualAvailable: true, mockAvailable: true, learningDays: 0, completedActivities: 0 };

describe("weekly plan policy", () => {
  it("uses the Vietnam product week and never assigns weekdays to study slots", () => {
    expect(productWeekStart(new Date("2026-09-20T16:59:59Z"))).toBe("2026-09-14");
    expect(productWeekStart(new Date("2026-09-20T17:00:00Z"))).toBe("2026-09-21");
    expect(productWeekWindow(new Date("2026-09-24T17:30:00Z")).start.toISOString()).toBe("2026-09-20T17:00:00.000Z");
    expect(buildWeeklyPlan(input).items.map(item => item.slot)).toEqual([1, 2, 3, 4, 5]);
  });

  it.each([3, 5, 7] as const)("builds %i study sessions without requiring a target", days => {
    const plan = buildWeeklyPlan({ ...input, goal: goal(days, 20) });
    expect(plan.items).toHaveLength(days);
    expect(plan.preview).toHaveLength(Math.min(days, 3));
  });

  it.each([10, 20, 30, 45, 60] as const)("uses a %i-minute capacity", minutes => {
    const plan = buildWeeklyPlan({ ...input, goal: goal(5, minutes) });
    expect(plan.studyMinutes).toBe(minutes);
    expect(plan.items.every(item => item.minutes <= minutes)).toBe(true);
  });

  it("prioritizes reviewable repeated mistakes for Premium and includes only ready, entitled mocks", () => {
    const base = { ...input, plan: "PREMIUM" as const, goal: goal(7, 45), reviewableMistakes: 8, repeatedMistakes: 3, completedActivities: 2, completedByActivity: { WORKOUT: 1, REVIEW: 1 } };
    const plan = buildWeeklyPlan(base);
    expect(plan.items).toHaveLength(7);
    expect(plan.preview).toHaveLength(7);
    expect(plan.items.some(item => item.activity === "WORKOUT" && item.completed)).toBe(true);
    expect(plan.items.some(item => item.activity === "REVIEW" && item.completed)).toBe(true);
    expect(plan.items[2].activity).toBe("REVIEW");
    expect(plan.items.some(item => item.activity === "MOCK_LISTENING")).toBe(true);
    expect(buildWeeklyPlan({ ...base, mockListeningReady: false }).items.some(item => item.activity === "MOCK_LISTENING")).toBe(false);
    expect(buildWeeklyPlan({ ...base, mockAvailable: false }).items.some(item => item.activity === "MOCK_LISTENING")).toBe(false);
  });

  it("adds deeper Reading work only for a supported Premium weakness with ready content", () => {
    const supported = { ...recommendation, kind: "FOCUSED" as const, reasonCode: "SUPPORTED_WEAKNESS" as const };
    const base = { ...input, recommendation: supported, focusedReadingReady: true };
    expect(buildWeeklyPlan({ ...base, plan: "PREMIUM" }).items.some(item => item.activity === "FOCUSED_READING")).toBe(true);
    expect(buildWeeklyPlan(base).items.some(item => item.activity === "FOCUSED_READING")).toBe(false);
    expect(buildWeeklyPlan({ ...base, plan: "PREMIUM", focusedReadingReady: false }).items.some(item => item.activity === "FOCUSED_READING")).toBe(false);
  });

  it("keeps slot order stable when quota is exhausted and marks its CTA unavailable", () => {
    const before = buildWeeklyPlan(input);
    const after = buildWeeklyPlan({ ...input, workoutAvailable: false, manualAvailable: false });
    expect(after.items.map(item => item.activity)).toEqual(before.items.map(item => item.activity));
    expect(after.items.every(item => !item.available)).toBe(true);
  });

  it("marks only a matching activity as completed", () => {
    const plan = buildWeeklyPlan({ ...input, completedActivities: 1, completedByActivity: { READING: 1 } });
    expect(plan.items[0]).toMatchObject({ activity: "WORKOUT", completed: false });
    expect(plan.items[1]).toMatchObject({ activity: "READING", completed: true });
  });

  it("does not invent review or practice content", () => {
    const plan = buildWeeklyPlan({ ...input, recommendation: null, recommendedReady: false, readingReady: false, listeningReady: false, reviewableMistakes: 0 });
    expect(plan.items).toEqual([]);
    expect(buildWeeklyPlan({ ...input, reviewableMistakes: 0 }).items.some(item => item.activity === "REVIEW")).toBe(false);
  });
});
