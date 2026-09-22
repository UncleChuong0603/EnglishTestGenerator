import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const preview = readFileSync("src/lib/premium/preview.ts", "utf8");

describe("Premium preview architecture", () => {
  it("derives the subject from the authenticated session", () => {
    expect(preview).toContain("const user = await requireUser()");
    expect(preview).toContain("const userId = user.id");
    expect(preview).not.toMatch(/getPremiumPreview[^=]*\(\s*userId/);
  });

  it("returns aggregates without exposing raw answers", () => {
    expect(preview).toContain("getToeicProgress(userId)");
    expect(preview).toContain("getMistakeOverview(userId)");
    expect(preview).not.toContain("selectedOptionId");
    expect(preview).not.toContain("correctOptionId");
  });
});
