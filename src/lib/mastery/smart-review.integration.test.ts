import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyMasteryEvidence } from "./state";
import { compareReviewPriority, type PriorityEvidence } from "./priority";

const selector = readFileSync("src/lib/practice/selector.ts", "utf8");
const action = readFileSync("src/app/mistakes/actions.ts", "utf8");
const queries = readFileSync("src/lib/mastery/queries.ts", "utf8");

const evidence = (questionId: string, changes: Partial<PriorityEvidence> = {}): PriorityEvidence => ({
  questionId, wrongCount: 1, lastMissedAt: new Date("2026-09-01T00:00:00Z"), lastReviewedAt: null, reviewSuccessStreak: 0, ...changes,
});

describe("Smart Mistake Review integration contract", () => {
  it("orders real wrong-answer evidence before session creation and preserves grouped units", () => {
    const rows = [evidence("recent", { lastMissedAt: new Date("2026-09-10") }), evidence("repeated", { wrongCount: 2 })].sort(compareReviewPriority);
    expect(rows.map((row) => row.questionId)).toEqual(["repeated", "recent"]);
    expect(queries).toContain("wrong.is_correct = false");
    expect(selector).toContain("getSmartReviewCandidates");
    expect(selector).toContain("expandReviewGroups");
    expect(selector).toContain("const units = new Set<string>()");
  });

  it("enforces Premium on the server even when a Free user posts smart=true", () => {
    expect(action).toContain('formData.get("smart") === "true"');
    expect(selector).toContain("canUseSmartMistakeReview");
    expect(selector).toContain('throw new Error("PREMIUM_REQUIRED")');
  });

  it("keeps the canonical mastery lifecycle unchanged", () => {
    const once = applyMasteryEvidence({ status: "UNRESOLVED", reviewAttemptCount: 0, reviewSuccessStreak: 0 }, "review", true);
    expect(once.status).toBe("UNRESOLVED");
    expect(applyMasteryEvidence(once, "review", true).status).toBe("MASTERED");
    expect(applyMasteryEvidence(once, "review", false).reviewSuccessStreak).toBe(0);
    expect(applyMasteryEvidence({ status: "MASTERED", reviewAttemptCount: 2, reviewSuccessStreak: 2 }, "normal", false).status).toBe("UNRESOLVED");
  });

  it("creates the available pool without filler and consumes quota only inside creation", () => {
    expect(selector).toContain("if (estimatedQuestions >= targetSize) break");
    expect(selector).not.toMatch(/filler/i);
    const masteryCreation = selector.indexOf("export async function createMasteryReviewSession");
    expect(selector.indexOf("if (!expanded.length)", masteryCreation)).toBeLessThan(selector.indexOf("consumeUsage(tx", masteryCreation));
    expect(selector).toContain('entitlement: "MASTERY_REVIEW"');
  });

  it("retains unavailable mastery rows while excluding them from candidates", () => {
    expect(queries).toContain("reviewableContent");
    expect(queries).toContain('eq(questionMastery.status, "UNRESOLVED")');
    expect(queries).not.toMatch(/delete\(questionMastery\)/);
  });
});
