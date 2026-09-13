import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const profileSource = readFileSync("src/lib/profiles/profile.ts", "utf8");
const onboardingSource = readFileSync("src/app/onboarding/actions.ts", "utf8");

describe("profile compatibility during preference migration rollout", () => {
  it("does not make the core profile lookup depend on language columns", () => {
    const selectCall = profileSource.match(/\.select\(([^\n]+)\)/)?.[1] ?? "";
    expect(selectCall).not.toContain("interface_language");
    expect(selectCall).not.toContain("explanation_language");
  });

  it("retries onboarding without optional preference columns when they are absent", () => {
    expect(onboardingSource).toContain('error?.code === "42703"');
    expect(onboardingSource).toContain('error?.code === "PGRST204"');
    expect(onboardingSource).toContain("upsert(profile");
  });
});
