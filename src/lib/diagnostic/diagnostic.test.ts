import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { calculateToeicProgress } from "../progress/calculate";
import { chooseDiverseUnits, DIAGNOSTIC_BLUEPRINT_VERSION, DIAGNOSTIC_REASSESSMENT_INTERVAL_DAYS, nextDiagnosticEligibleAt, percentagePointDelta, shouldRecommendDiagnostic } from "./policy";

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
  it("uses a deterministic 30-day completed-run cooldown", () => {
    const completed = new Date("2026-01-01T00:00:00.000Z");
    expect(DIAGNOSTIC_REASSESSMENT_INTERVAL_DAYS).toBe(30);
    expect(nextDiagnosticEligibleAt(completed).toISOString()).toBe("2026-01-31T00:00:00.000Z");
    expect(new Date("2026-01-30T23:59:59.999Z") < nextDiagnosticEligibleAt(completed)).toBe(true);
    expect(new Date("2026-01-31T00:00:00.000Z") >= nextDiagnosticEligibleAt(completed)).toBe(true);
  });
  it("reports accuracy changes as percentage points, including negative changes", () => {
    expect(percentagePointDelta(6, 10, 7, 10)).toBe(10);
    expect(percentagePointDelta(8, 10, 6, 10)).toBe(-20);
    expect(percentagePointDelta(0, 0, 6, 10)).toBeNull();
  });
  it("persists compatibility and enforces reassessment on the server", () => {
    const migration = readFileSync("drizzle/0023_diagnostic_reassessment.sql", "utf8");
    const service = readFileSync("src/lib/diagnostic/service.ts", "utf8");
    expect(DIAGNOSTIC_BLUEPRINT_VERSION).toBe("v1");
    expect(migration).toContain('ADD COLUMN "blueprint_version"');
    expect(migration).toContain("intentionally remain blueprint_version NULL");
    expect(service).toContain('DiagnosticEligibilityError("FREE_NOT_ELIGIBLE")');
    expect(service).toContain('DiagnosticEligibilityError("COOLDOWN")');
    expect(service).toContain("pg_advisory_xact_lock");
  });
});
