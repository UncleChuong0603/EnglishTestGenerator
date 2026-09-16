import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { calculateToeicProgress } from "../progress/calculate";
import { chooseDiverseUnits, shouldRecommendDiagnostic } from "./policy";

describe("diagnostic policy", () => {
  it("recommends onboarding only to genuinely sparse learners", () => {
    expect(shouldRecommendDiagnostic(calculateToeicProgress([]), false)).toBe(true);
    const experienced = calculateToeicProgress([{ skillArea: "READING", part: 5, skill: "grammar", subskill: "verb", attemptedCount: 21, correctCount: 15, latestAttemptAt: null }]);
    expect(shouldRecommendDiagnostic(experienced, false)).toBe(false);
    expect(shouldRecommendDiagnostic(calculateToeicProgress([]), true)).toBe(false);
  });
  it("prefers distinct taxonomy signals deterministically", () => {
    const units = [{ id: "a", part: 5, questionIds: ["a"], skill: "grammar", subSkill: "verbs" }, { id: "b", part: 5, questionIds: ["b"], skill: "grammar", subSkill: "verbs" }, { id: "c", part: 5, questionIds: ["c"], skill: "vocabulary", subSkill: "meaning" }];
    expect(chooseDiverseUnits(units, 2).map((unit) => unit.id)).toEqual(["a", "c"]);
  });
  it("keeps diagnostic responses learner-safe while the parent is incomplete", () => {
    const actions = readFileSync("src/app/diagnostic/actions.ts", "utf8"); const queries = readFileSync("src/lib/practice/queries.ts", "utf8");
    expect(actions).not.toContain("correctOptionId:"); expect(actions).not.toContain("explanationEn:"); expect(actions).not.toContain("transcript:");
    expect(queries).toContain('parent.status !== "COMPLETED"');
  });
  it("defines parent ownership, seven children, expiry and concurrency protection", () => {
    const migration = readFileSync("drizzle/0005_diagnostic_runs.sql", "utf8"); const service = readFileSync("src/lib/diagnostic/service.ts", "utf8");
    expect(migration).toContain("diagnostic_runs_owner_check"); expect(migration).toContain("diagnostic_runs_one_active_user_idx"); expect(service).toContain(":diagnostic"); expect(service).toContain("DIAGNOSTIC_PARTS = [1, 2, 3, 4, 5, 6, 7]");
  });
});
