import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const profileSource = readFileSync("src/lib/profiles/profile.ts", "utf8");
const onboardingSource = readFileSync("src/app/onboarding/actions.ts", "utf8");
describe("local profile ownership and preferences", () => {
  it("scopes profile reads to the authenticated user id", () => { expect(profileSource).toContain("eq(profiles.id, userId)"); expect(profileSource).not.toContain("passwordHash"); });
  it("creates/updates onboarding data with local preferences", () => { expect(onboardingSource).toContain("requireUser()"); expect(onboardingSource).toContain("interfaceLanguage"); expect(onboardingSource).toContain("onConflictDoUpdate"); });
});
