import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("drizzle/0006_mistake_mastery.sql", "utf8");
const queries = readFileSync("src/lib/mastery/queries.ts", "utf8");
const selector = readFileSync("src/lib/practice/selector.ts", "utf8");
const persistence = readFileSync("src/lib/mastery/persistence.ts", "utf8");
const guest = readFileSync("src/lib/guest/migration.ts", "utf8");

describe("mistake bank architecture", () => {
  it("uses learner-question identity and conservatively backfills historical misses", () => { expect(migration).toContain('UNIQUE("user_id","question_id")'); expect(migration).toContain("min(coalesce(aa.\"answered_at\""); expect(migration).toContain("max(coalesce(aa.\"answered_at\""); expect(migration).toContain("ON CONFLICT"); });
  it("gates diagnostic evidence until its parent is completed", () => { expect(queries).toContain("dr.status = 'COMPLETED'"); expect(queries).toContain("visibleEvidence"); });
  it("derives all ownership on the server", () => { expect(queries).toContain("eq(questionMastery.userId, userId)"); expect(selector).toContain("createMasteryReviewSession(userId"); });
  it("preserves grouped content and prevents assignment duplicates", () => { expect(selector).toContain("expandReviewGroups"); expect(selector).toContain("const units = new Set<string>()"); expect(migration).toContain("mastery_review"); });
  it("centralizes submission and guest-claim reconciliation", () => { expect(persistence).toContain("MASTERY_REQUIRED_SUCCESS_STREAK"); expect(guest).toContain("reconcileMasteryAnswers"); });
});
