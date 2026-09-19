import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const sql = readFileSync("drizzle/0021_mock_test_modes.sql", "utf8");
describe("mock mode migration", () => {
  it("backfills legacy runs as FULL and enforces one active run per mode", () => { expect(sql).toContain("DEFAULT 'FULL' NOT NULL"); expect(sql).toContain("user_id\", \"mode"); expect(sql).toContain("full_mock_runs_one_active_user_mode_idx"); });
  it("supports Reading-only timing without weakening section integrity", () => { expect(sql).toContain("ALTER COLUMN \"listening_deadline\" DROP NOT NULL"); expect(sql).toContain("full_mock_runs_mode_sections_check"); expect(sql).toContain("'READING'"); });
});
