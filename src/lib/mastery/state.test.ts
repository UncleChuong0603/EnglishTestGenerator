import { describe, expect, it } from "vitest";
import { applyMasteryEvidence } from "./state";

const unresolved = { status: "UNRESOLVED" as const, reviewAttemptCount: 0, reviewSuccessStreak: 0 };
describe("mastery lifecycle", () => {
  it("requires two consecutive dedicated review successes", () => { const once = applyMasteryEvidence(unresolved, "review", true); expect(once).toEqual({ status: "UNRESOLVED", reviewAttemptCount: 1, reviewSuccessStreak: 1 }); expect(applyMasteryEvidence(once, "review", true).status).toBe("MASTERED"); });
  it("resets a review streak after a wrong review", () => { expect(applyMasteryEvidence({ ...unresolved, reviewSuccessStreak: 1 }, "review", false)).toEqual({ status: "UNRESOLVED", reviewAttemptCount: 1, reviewSuccessStreak: 0 }); });
  it("does not advance on an ordinary correct answer", () => { expect(applyMasteryEvidence({ ...unresolved, reviewSuccessStreak: 1 }, "normal", true).reviewSuccessStreak).toBe(1); });
  it("reopens mastered state after an ordinary wrong answer", () => { expect(applyMasteryEvidence({ status: "MASTERED", reviewAttemptCount: 2, reviewSuccessStreak: 2 }, "normal", false)).toEqual({ status: "UNRESOLVED", reviewAttemptCount: 2, reviewSuccessStreak: 0 }); });
});
