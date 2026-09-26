import { describe, expect, it } from "vitest";
import { lifecycleCandidates, lifecycleMessage } from "./lifecycle-policy";

const now = new Date("2026-09-28T01:15:00.000Z"); // Monday 08:15 Vietnam
const base = { createdAt: new Date(now.getTime() - 36 * 3_600_000), sessions: [], previousWeekSessions: 0 };
const types = (input: Parameters<typeof lifecycleCandidates>[0], at = now) => lifecycleCandidates(input, at).map(c => c.type);

describe("lifecycle policy", () => {
  it("invites a verified opt-in signup only in the 24–48 hour window", () => {
    expect(types(base)).toEqual(["signup_no_learning"]);
    expect(types({ ...base, createdAt: new Date(now.getTime() - 23 * 3_600_000) })).toEqual([]);
    expect(types({ ...base, createdAt: new Date(now.getTime() - 49 * 3_600_000) })).toEqual([]);
  });
  it("reminds once after one real first learning session", () => {
    const first = new Date(now.getTime() - 36 * 3_600_000);
    expect(types({ ...base, sessions: [first] })).toEqual(["day1_return"]);
    expect(types({ ...base, sessions: [first, first], sessionCount: 2 })).toEqual([]);
  });
  it("reminds once at three days of inactivity", () => {
    const last = new Date(now.getTime() - 75 * 3_600_000);
    expect(types({ ...base, sessions: [last], sessionCount: 3 })).toEqual(["inactive_3d"]);
    expect(types({ ...base, sessions: [new Date(now.getTime() - 97 * 3_600_000)], sessionCount: 3 })).toEqual([]);
  });
  it("prioritizes a completed weekly review at the Vietnam week boundary", () => {
    const last = new Date(now.getTime() - 75 * 3_600_000);
    expect(types({ ...base, sessions: [last], sessionCount: 3, previousWeekSessions: 2 })).toEqual(["weekly_review", "inactive_3d"]);
    expect(types({ ...base, previousWeekSessions: 2 }, new Date("2026-09-28T00:59:59.000Z"))).toEqual(["signup_no_learning"]);
  });
  it("uses factual short Vietnamese copy with unsubscribe and no claim about scores", () => {
    const message = lifecycleMessage("weekly_review", "https://toeicgym.net", "https://toeicgym.net/unsubscribe?token=opaque", { sessions: 2 });
    expect(message.text).toContain("2 buổi học");
    expect(message.text).toContain("/dashboard#weekly-review");
    expect(message.text).toContain("/unsubscribe?token=opaque");
    expect(message.text).not.toMatch(/điểm TOEIC|streak|sắp mất/i);
  });
});
