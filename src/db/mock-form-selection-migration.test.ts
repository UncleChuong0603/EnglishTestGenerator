import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mock form selection migration", () => {
  it("allows a validated form number for every mock mode", () => {
    const sql = readFileSync("drizzle/0055_mock_form_selection.sql", "utf8");
    expect(sql).toContain('DROP CONSTRAINT "full_mock_runs_form_number_check"');
    expect(sql).toContain('"form_number" BETWEEN 1 AND 25');
    expect(sql).not.toContain('"mode"=\'FULL\'');
  });
});
