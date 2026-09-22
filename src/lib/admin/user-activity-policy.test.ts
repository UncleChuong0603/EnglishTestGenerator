import { describe, expect, it } from "vitest";
import {
  RETENTION_METRIC_DEFINITIONS,
  RETENTION_PRODUCT_TIME_ZONE,
  countProductDays,
  getLastMeaningfulAction,
  getLearnerActivityState,
  getRetentionProductWindow,
  safeUserActivityMetadata,
  type UserActivityItem,
} from "./user-activity-policy";

const activity = (overrides: Partial<UserActivityItem> = {}): UserActivityItem => ({
  key: "account:1",
  occurredAt: new Date("2026-09-21T13:00:00.000Z"),
  category: "ACCOUNT",
  action: "ACCOUNT_CREATED",
  source: "users",
  summary: null,
  metadata: {},
  priority: 10,
  ...overrides,
});

describe("Task 27 retention policy", () => {
  it("keeps every required definition centralized and uses the product timezone", () => {
    expect(Object.keys(RETENTION_METRIC_DEFINITIONS)).toEqual([
      "ACTIVATED",
      "LEARNING_DAY",
      "RETURNED_2_DAYS_7D",
      "RETURNED_3_DAYS_7D",
      "NO_MEANINGFUL_LEARNING",
    ]);
    expect(RETENTION_PRODUCT_TIME_ZONE).toBe("Asia/Ho_Chi_Minh");
  });

  it("counts the 23:59/00:00 Vietnam boundary as two product days", () => {
    expect(countProductDays([
      new Date("2026-09-21T16:59:59.000Z"),
      new Date("2026-09-21T17:00:00.000Z"),
    ])).toBe(2);
  });

  it("creates a seven-product-day inclusive window", () => {
    const window = getRetentionProductWindow(new Date("2026-09-22T12:00:00.000Z"));
    expect(window.start.toISOString()).toBe("2026-09-15T17:00:00.000Z");
    expect(window.end.toISOString()).toBe("2026-09-22T17:00:00.000Z");
  });

  it.each([
    [0, null, "NO_LEARNING_YET"],
    [1, new Date("2026-09-22T03:00:00.000Z"), "ONE_DAY_LEARNER"],
    [2, new Date("2026-09-22T03:00:00.000Z"), "RETURNING_LEARNER"],
    [3, new Date("2026-09-10T03:00:00.000Z"), "INACTIVE"],
  ] as const)("derives lifecycle for %s learning days", (learningDays, lastLearningAt, expected) => {
    expect(getLearnerActivityState({ learningDays, lastLearningAt, now: new Date("2026-09-22T12:00:00.000Z") })).toBe(expected);
  });

  it("uses timestamp then priority for the last meaningful action", () => {
    expect(getLastMeaningfulAction([
      activity({ key: "start", action: "PRACTICE_STARTED", occurredAt: new Date("2026-09-21T13:10:00Z"), priority: 60 }),
      activity({ key: "complete", action: "PRACTICE_COMPLETED", occurredAt: new Date("2026-09-21T13:10:00Z"), priority: 80 }),
    ])?.action).toBe("PRACTICE_COMPLETED");
  });

  it("keeps timeline metadata aggregate-only", () => {
    expect(safeUserActivityMetadata({ questionCount: 10, accuracy: 70, passwordHash: "secret", questionText: "protected", guestOwnerHash: "hash" })).toEqual({ questionCount: 10, accuracy: 70 });
  });
});
