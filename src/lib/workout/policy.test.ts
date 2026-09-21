import { describe, expect, it } from "vitest";
import { dailyGoalProgress, getDailyWorkload, getDashboardLifecycle, getGroupSafeWorkoutSize } from "./policy";

const limited = (remaining: number) => ({ type: "LIMITED" as const, used: 1 - remaining, limit: 1, remaining, resetAt: "2026-09-22T17:00:00.000Z" });
const goal = (minutes: 10 | 20 | 30 | 45 | 60 | null) => minutes === null ? null : ({ targetScore: null, examDate: null, dailyStudyMinutes: minutes, studyDaysPerWeek: null, updatedAt: "2026-09-21T00:00:00.000Z" });

describe("daily workload policy", () => {
  it("uses the current-product fallback without a Goal Profile", () => {
    expect(getDailyWorkload({ goal: null, plan: "FREE", workoutUsage: limited(1) })).toMatchObject({ studyMinutes: 20, targetQuestions: 10, workoutAvailable: true });
  });

  it.each([[10, 10], [20, 10], [30, 15], [45, 20], [60, 20]] as const)("maps %i minutes to %i questions", (minutes, questions) => {
    expect(getDailyWorkload({ goal: goal(minutes), plan: "PREMIUM", workoutUsage: { type: "UNLIMITED", used: 0, resetAt: null } }).targetQuestions).toBe(questions);
  });

  it("keeps a partial Goal Profile on the fallback capacity", () => {
    expect(getDailyWorkload({ goal: { targetScore: 750, examDate: null, dailyStudyMinutes: null, studyDaysPerWeek: 5, updatedAt: "2026-09-21T00:00:00.000Z" }, plan: "FREE", workoutUsage: limited(1) }).targetQuestions).toBe(10);
  });

  it("reports quota availability without changing the stable target", () => {
    expect(getDailyWorkload({ goal: goal(60), plan: "FREE", workoutUsage: limited(0) })).toMatchObject({ targetQuestions: 20, workoutAvailable: false });
  });

  it("preserves grouped Listening units", () => {
    expect(getGroupSafeWorkoutSize(3, 10)).toEqual({ questionCount: 9, groupCount: 3 });
    expect(getGroupSafeWorkoutSize(4, 20)).toEqual({ questionCount: 21, groupCount: 7 });
    expect(getGroupSafeWorkoutSize(7, 15)).toEqual({ questionCount: 15, groupCount: null });
  });

  it.each([[0, 10, 0, false], [4, 10, 40, false], [10, 10, 100, true], [14, 10, 100, true]] as const)("derives progress for %i of %i", (done, target, percent, complete) => {
    expect(dailyGoalProgress(done, target)).toMatchObject({ percent, complete });
  });
});

describe("dashboard lifecycle", () => {
  it.each([
    ["NEW", true, false, false, 0],
    ["DIAGNOSED", false, false, false, 0],
    ["ACTIVE", false, false, false, 2],
    ["RESUMABLE", false, true, false, 2],
    ["DAILY_GOAL_COMPLETE", false, false, true, 2],
  ] as const)("derives %s from authoritative state", (expected, recommendDiagnostic, hasResumablePractice, dailyGoalComplete, completedLearningSessions) => {
    expect(getDashboardLifecycle({ recommendDiagnostic, hasResumablePractice, dailyGoalComplete, completedLearningSessions })).toBe(expected);
  });
});
