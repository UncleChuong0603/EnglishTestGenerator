import { describe, expect, it } from "vitest";
import { ADMIN_RETENTION_DEFINITIONS, ADMIN_RETENTION_TIME_ZONE, retentionState, retentionWindow, sortAndLimitTimeline, type UserActivityItem } from "./retention";

describe("Task 27 retention domain", () => {
  it("documents the authoritative learning states", () => {
    expect(Object.keys(ADMIN_RETENTION_DEFINITIONS)).toEqual(["ACTIVATED", "LEARNING_DAY", "RETURNED_2_DAYS_7D", "RETURNED_3_DAYS_7D", "NO_MEANINGFUL_LEARNING"]);
    expect(ADMIN_RETENTION_TIME_ZONE).toBe("Asia/Ho_Chi_Minh");
  });

  it("uses seven complete product days across the UTC boundary", () => {
    const beforeMidnight = retentionWindow(new Date("2026-09-18T16:59:59.999Z"));
    const afterMidnight = retentionWindow(new Date("2026-09-18T17:00:00.000Z"));
    expect(beforeMidnight.start.toISOString()).toBe("2026-09-11T17:00:00.000Z");
    expect(afterMidnight.start.toISOString()).toBe("2026-09-12T17:00:00.000Z");
    expect(afterMidnight.end.getTime() - afterMidnight.start.getTime()).toBe(7 * 86_400_000);
  });

  it("derives useful lifecycle labels without storing another state machine", () => {
    const now = new Date("2026-09-22T12:00:00.000Z");
    expect(retentionState(0, null, now)).toBe("NO_LEARNING");
    expect(retentionState(1, new Date("2026-09-22T10:00:00Z"), now)).toBe("ONE_DAY");
    expect(retentionState(2, new Date("2026-09-21T10:00:00Z"), now)).toBe("ACTIVE");
    expect(retentionState(3, new Date("2026-09-10T10:00:00Z"), now)).toBe("RETURNING");
  });

  it("orders the timeline newest-first and enforces its privacy-friendly bound", () => {
    const item = (id: string, occurredAt: string): UserActivityItem => ({ id, occurredAt: new Date(occurredAt), category: "ACCOUNT", action: "ACCOUNT_CREATED", source: "users", summary: null, metadata: {} });
    const rows = Array.from({ length: 120 }, (_, index) => item(String(index), `2026-09-${String((index % 20) + 1).padStart(2, "0")}T00:00:00Z`));
    const result = sortAndLimitTimeline(rows, 100);
    expect(result).toHaveLength(100);
    expect(result[0].occurredAt.getTime()).toBeGreaterThanOrEqual(result.at(-1)!.occurredAt.getTime());
    expect(JSON.stringify(result)).not.toMatch(/password|token|questionText|selectedOption/i);
  });
});
