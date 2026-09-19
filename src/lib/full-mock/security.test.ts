import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const service = readFileSync("src/lib/full-mock/service.ts", "utf8");
const practice = readFileSync("src/lib/practice/queries.ts", "utf8");
const progress = readFileSync("src/lib/progress/queries.ts", "utf8");
const mastery = readFileSync("src/lib/mastery/queries.ts", "utf8");

describe("full mock security boundaries", () => {
  it("saves into a no-correctness staging table with ownership, assignment, option and deadline checks", () => {
    expect(service).toContain("fullMockAnswers"); expect(service).toContain("practiceSessionQuestions"); expect(service).toContain("questionOptions"); expect(service).toContain("deadline <= new Date()");
  });
  it("blocks child review until the parent is complete", () => { expect(practice).toContain('parent.status !== "COMPLETED"'); expect(practice).toContain("session.fullMockRunId"); });
  it("isolates incomplete evidence from progress and mistakes", () => { expect(progress).toContain("fullMockRuns.status"); expect(mastery).toContain("fmr.status = 'COMPLETED'"); });
  it("reconciles mastery only in the shared overall-completion path", () => { expect(service.lastIndexOf("reconcileMasteryAnswers")).toBeGreaterThan(service.indexOf("async function completeRun")); expect(service.match(/reconcileMasteryAnswers/g)).toHaveLength(2); });
});
