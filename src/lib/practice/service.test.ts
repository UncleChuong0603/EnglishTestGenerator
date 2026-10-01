import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadRecommendedWorkout: vi.fn(),
  getUsageStatus: vi.fn(),
  getLearnerGoal: vi.fn(),
  getDailyWorkload: vi.fn(),
  getGroupSafeWorkoutSize: vi.fn(),
  createListeningPracticeSession: vi.fn(),
  createMasteryReviewSession: vi.fn(),
  createReadingPracticeSession: vi.fn(),
  createRecommendedListeningPracticeSession: vi.fn(),
  createRecommendedReadingPracticeSession: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/diagnosis/service", () => ({
  loadRecommendedWorkout: mocks.loadRecommendedWorkout,
  isListeningPart: (part: number | null) => part !== null && part >= 1 && part <= 4,
}));
vi.mock("@/lib/entitlements/service", () => ({ getUsageStatus: mocks.getUsageStatus }));
vi.mock("@/lib/goals/service", () => ({ getLearnerGoal: mocks.getLearnerGoal }));
vi.mock("@/lib/workout/policy", () => ({
  getDailyWorkload: mocks.getDailyWorkload,
  getGroupSafeWorkoutSize: mocks.getGroupSafeWorkoutSize,
}));
vi.mock("./selector", () => ({
  createListeningPracticeSession: mocks.createListeningPracticeSession,
  createMasteryReviewSession: mocks.createMasteryReviewSession,
  createReadingPracticeSession: mocks.createReadingPracticeSession,
  createRecommendedListeningPracticeSession: mocks.createRecommendedListeningPracticeSession,
  createRecommendedReadingPracticeSession: mocks.createRecommendedReadingPracticeSession,
}));

import { startPractice } from "./service";
import type { PracticeConfig } from "./types";

describe("shared practice start boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getLearnerGoal.mockResolvedValue(null);
    mocks.getUsageStatus.mockResolvedValue({
      effectivePlan: "FREE",
      entitlements: { TODAYS_WORKOUT: { type: "LIMITED", used: 0, limit: 1, remaining: 1, resetAt: "2026-10-02T00:00:00.000Z" } },
    });
    mocks.getDailyWorkload.mockReturnValue({ targetQuestions: 10 });
    mocks.getGroupSafeWorkoutSize.mockReturnValue({ questionCount: 10, groupCount: 3 });
  });

  it("delegates ordinary starts without accepting question IDs", async () => {
    const config = { mode: "part_5", targetQuestionCount: 10, source: "custom" } satisfies PracticeConfig;
    mocks.createReadingPracticeSession.mockResolvedValue("reading-session");
    mocks.createListeningPracticeSession.mockResolvedValue("listening-session");
    mocks.createMasteryReviewSession.mockResolvedValue("review-session");

    await expect(startPractice("user-1", { kind: "CUSTOM_READING", config })).resolves.toBe("reading-session");
    await expect(startPractice("user-1", { kind: "CUSTOM_LISTENING", part: 2 })).resolves.toBe("listening-session");
    await expect(startPractice("user-1", { kind: "MASTERY_REVIEW", part: 5, smart: true, size: 10 })).resolves.toBe("review-session");
    expect(mocks.createReadingPracticeSession).toHaveBeenCalledWith("user-1", config);
    expect(mocks.createListeningPracticeSession).toHaveBeenCalledWith("user-1", 2, 10);
    expect(mocks.createMasteryReviewSession).toHaveBeenCalledWith("user-1", 5, { smart: true, size: 10 });
  });

  it("keeps Today's Workout recommendation and selection server-authoritative", async () => {
    mocks.loadRecommendedWorkout.mockResolvedValue({
      skillArea: "READING",
      part: 6,
      primarySkill: "reading",
      primarySubskill: "context",
    });
    mocks.createRecommendedReadingPracticeSession.mockResolvedValue("recommended-session");
    await expect(startPractice("user-1", { kind: "TODAYS_WORKOUT" })).resolves.toBe("recommended-session");
    expect(mocks.createRecommendedReadingPracticeSession).toHaveBeenCalledWith("user-1", {
      part: 6,
      skill: "reading",
      subSkill: "context",
      questionCount: 10,
    });
  });

  it("checks Premium and server-derived weakness before weekly focus", async () => {
    mocks.getUsageStatus.mockResolvedValue({ effectivePlan: "FREE", entitlements: { TODAYS_WORKOUT: {} } });
    mocks.loadRecommendedWorkout.mockResolvedValue({ skillArea: "READING", part: 5, reasonCode: "SUPPORTED_WEAKNESS" });
    await expect(startPractice("user-1", { kind: "WEEKLY_FOCUS" })).rejects.toThrow("PREMIUM_REQUIRED");
    expect(mocks.createRecommendedReadingPracticeSession).not.toHaveBeenCalled();
  });
});
