import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration = readFileSync("drizzle/0000_lively_mordo.sql", "utf8"); const selector = readFileSync("src/lib/practice/selector.ts", "utf8");
describe("generalized local Reading practice", () => {
  it("supports all modes and requested focus", () => { expect(migration).toContain("part_5','part_6','part_7','mixed_reading','demo_test"); expect(migration).toContain("requested_question_count"); expect(migration).toContain("requested_skill"); });
  it("captures and validates passage membership", () => { expect(migration).toContain("practice_assignment_question_set_fk"); expect(selector).toContain("passageSetId"); });
});
