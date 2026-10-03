import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const actions = readFileSync("src/app/practice/actions.ts", "utf8");
const practiceService = readFileSync("src/lib/practice/service.ts", "utf8");
const selector = readFileSync("src/lib/practice/selector.ts", "utf8");
const results = readFileSync("src/app/practice/[sessionId]/results/page.tsx", "utf8");

describe("recommended workout application boundary", () => {
  it("accepts no client target or learner identity and authenticates server-side", () => {
    expect(actions).toContain("export async function startRecommendedPractice()");
    expect(actions).toMatch(/startRecommendedPractice\(\)[\s\S]*getCurrentUser\(\)/);
    expect(actions).toContain('startPractice(user.id, { kind: "TODAYS_WORKOUT" })');
    expect(practiceService).toMatch(/startTodaysWorkout\(userId: string(?:, transaction\?: PracticeTransaction)?\)[\s\S]*loadRecommendedWorkout\(userId\)/);
  });

  it("passes only the server-calculated Listening target into eligible selection", () => {
    expect(practiceService).toContain("createRecommendedListeningPracticeSession(userId");
    expect(practiceService).not.toContain("questionIds");
    expect(selector).toContain("validateListeningEligibility");
    expect(selector).toContain("validateListeningGroupEligibility");
    expect(selector).toContain('source: "recommended"');
  });

  it("recalculates a post-submit recommendation on the result page", () => {
    expect(results).toContain("loadRecommendedWorkout(user.id)");
    expect(results).toContain("UnifiedRecommendationCard");
    expect(actions).toContain("revalidatePath(`/practice/${sessionId}/results`)");
  });
});
