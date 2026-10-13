import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("automated editorial remediation migration", () => {
  const sql = readFileSync("drizzle/0058_automated_editorial_remediation.sql", "utf8");

  it("records automated review without impersonating a human reviewer", () => {
    expect(sql).toContain("AUTOMATED_EDITORIAL_REVIEWED");
    expect(sql).toContain("IMPORT_AUTOMATED_REVIEW_COMPLETED");
    expect(sql).toContain("CONTENT_REMEDIATED");
  });
});
