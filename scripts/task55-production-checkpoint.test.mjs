import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("scripts/task55-production-checkpoint.mjs", "utf8");

describe("Task 55 production checkpoint boundaries", () => {
  it("uses a read-only aggregate-only production transaction", () => {
    expect(source).toContain('BEGIN READ ONLY');
    expect(source).toContain('ROLLBACK');
    expect(source).not.toMatch(/select\s+(?:u\.)?email\b/i);
    expect(source).not.toMatch(/select\s+.*properties\b/i);
  });

  it("excludes deleted, QA and admin accounts from learner cohorts", () => {
    expect(source).toContain("u.deleted_at is null");
    expect(source).toContain("%@qa.invalid");
    expect(source).toContain("%@example.invalid");
    expect(source).toContain("r.role='ADMIN'");
  });

  it("defines mature cohorts and a minimum decision threshold", () => {
    expect(source).toContain("minimumDecisionCohort: 20");
    expect(source).toContain("created_at<=now()-interval '2 days'");
    expect(source).toContain("created_at<=now()-interval '3 days'");
  });

  it("covers the required product, mobile, monetization and quality loops", () => {
    for (const boundary of [
      "TODAYS_WORKOUT",
      "WEEKLY_PLAN",
      "MISTAKE_REASON",
      "REMEDIATION",
      "VOCAB_SRS",
      "DICTATION",
      "trial_to_paid",
      "second_learning_day",
      "push_opt_in_users",
      "question_issue_reports",
      "media_assets",
    ]) expect(source).toContain(boundary);
  });
});
