import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("drizzle/0012_ranking_challenges.sql", "utf8");
const runtime = readFileSync("drizzle/0013_ranked_challenge_runtime.sql", "utf8");
const constraints = readFileSync("drizzle/0014_ranked_practice_session_constraints.sql", "utf8");
const journal = readFileSync("drizzle/meta/_journal.json", "utf8");

describe("Task 16 migrations", () => {
  it("appends 0012 through 0014 after protected 0011", () => {
    const parsed = JSON.parse(journal);
    const tags = parsed.entries.map((entry: { tag: string }) => entry.tag);
    expect(tags.slice(-4)).toEqual([
      "0011_practice_session_count_invariants",
      "0012_ranking_challenges",
      "0013_ranked_challenge_runtime",
      "0014_ranked_practice_session_constraints",
    ]);
  });

  it("has privacy, idempotency and one-attempt constraints", () => {
    expect(sql).toContain("DEFAULT 'ANONYMOUS'");
    expect(sql).toContain("UNIQUE NULLS NOT DISTINCT");
    expect(sql).toContain('CONSTRAINT "ranked_challenge_runs_user_unique" UNIQUE');
  });

  it("adds runtime deadlines, child linkage, archive guard and compatible session constraints", () => {
    expect(runtime).toContain('"listening_deadline"');
    expect(runtime).toContain('"ranked_challenge_run_id"');
    expect(runtime).toContain("protect_active_challenge_content");
    expect(constraints).toContain("ranked_section_complete");
    expect(constraints).toContain("ranked_challenge");
  });

  it("does not backfill history", () => {
    expect((sql + runtime + constraints).toLowerCase()).not.toMatch(/insert into "gamification_events"\s+select/);
  });
});
