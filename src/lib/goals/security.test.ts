import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("learner goal ownership boundary", () => {
  const action = readFileSync("src/app/settings/goal-actions.ts", "utf8");
  it("resolves the authenticated user on the server", () => {
    expect(action).toContain("await getCurrentUser()");
    expect(action).toContain("updateLearnerGoal(user.id");
    expect(action).toContain('error: "unauthenticated"');
  });
  it("does not accept an arbitrary user id from form data", () => {
    expect(action).not.toContain('formData.get("userId")');
    expect(action).not.toContain('formData.get("user_id")');
  });
});
