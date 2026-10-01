import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const selector = readFileSync("src/lib/practice/selector.ts", "utf8");
const action = readFileSync("src/app/practice/actions.ts", "utf8");
const persistence = readFileSync("src/lib/mastery/persistence.ts", "utf8");
const schema = readFileSync("src/db/schema/index.ts", "utf8");

describe("focused remediation architecture", () => {
  it("derives a wrong answer and taxonomy from an owned submitted session", () => {
    expect(selector).toContain("eq(practiceSessions.userId, userId)");
    expect(selector).toContain('eq(practiceSessions.status, "submitted")');
    expect(selector).toContain("eq(attemptAnswers.isCorrect, false)");
    expect(action).not.toContain('formData.get("questionId")');
  });

  it("maps a different recheck question back to the existing mastery row", () => {
    expect(schema).toContain("masteryTargetQuestionId");
    expect(persistence).toContain("answer.masteryTargetQuestionId ?? answer.questionId");
    expect(persistence).toContain("MASTERY_REQUIRED_SUCCESS_STREAK");
  });

  it("uses existing quota and Premium capability without a new entitlement", () => {
    expect(selector).toContain('entitlement: "MASTERY_REVIEW"');
    expect(selector).toContain("canUseSmartMistakeReview");
    expect(selector).toContain("createMasteryReviewSession");
  });
});
