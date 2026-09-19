import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Premium advanced targeting architecture", () => {
  const actions = readFileSync("src/app/practice/actions.ts", "utf8");
  const selector = readFileSync("src/lib/practice/selector.ts", "utf8");
  const migration = readFileSync("drizzle/0022_advanced_practice_targeting.sql", "utf8");

  it("enforces the capability in the server action", () => {
    expect(actions).toContain("getEffectiveCapabilities(user.id)");
    expect(actions).toContain("!capabilities.canUseAdvancedTargeting");
    expect(actions.indexOf("!capabilities.canUseAdvancedTargeting")).toBeLessThan(actions.indexOf('targetingMode === "target_weakness"'));
  });

  it("reuses canonical weakness and mastery services", () => {
    expect(actions).toContain("getReadingRecommendation(user.id, undefined, scope)");
    expect(actions).toContain("createMasteryReviewSession(user.id");
    expect(selector).toContain("getReviewCandidates(userId, requestedPart)");
    expect(selector).toContain("expandReviewGroups(seedIds, part)");
    expect(selector).toContain('sessionSource === "target_weakness" ? primaryPools[2]');
  });

  it("persists traceable session intent with an append-only constraint migration", () => {
    expect(migration).toContain("target_weakness");
    expect(migration).toContain("prefer_unseen");
  });
});
