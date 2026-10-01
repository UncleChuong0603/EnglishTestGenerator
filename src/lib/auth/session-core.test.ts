import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile-safe auth core", () => {
  const core = readFileSync("src/lib/auth/session-core.ts", "utf8");
  it("has no Next transport dependency", () => {
    expect(core).not.toMatch(/next\/(navigation|headers)|cookies\(|redirect\(/);
    expect(core).toContain("issueSessionToken");
    expect(core).toContain("getSessionByToken");
  });
  it("requires active non-erased accounts and stores hashes only", () => {
    expect(core).toContain("isNull(users.deletedAt)");
    expect(core).toContain('row.status !== "active"');
    expect(core).toContain("sessionTokenHash: hashToken(token)");
    expect(core).toContain('for("update")');
  });
});
