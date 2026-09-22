import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("learner context authority", () => {
  const actions = readFileSync("src/app/settings/context-actions.ts", "utf8");
  it("resolves the current session and never accepts a browser userId", () => {
    expect(actions).toContain("getCurrentUser()");
    expect(actions).not.toContain('formData.get("userId")');
  });
});
