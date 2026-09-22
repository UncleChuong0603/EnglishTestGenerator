import { describe, expect, it } from "vitest";
import { DIAGNOSTIC_REASSESSMENT_INTERVAL_DAYS } from "@/lib/diagnostic/policy";
import {
  PLAN_CAPABILITIES,
  PLAN_CATALOG,
  type EntitlementKey,
} from "@/lib/entitlements/catalog";
import {
  PUBLIC_ACTIVATION_HREF,
  publicPlanFeatures,
  publicPlanNotes,
  type PublicFeatureKey,
} from "./public-product";

describe("public activation configuration", () => {
  it("routes the public primary action to guest practice", () => {
    expect(PUBLIC_ACTIVATION_HREF).toBe("/try");
  });

  it("publishes every metered entitlement from the canonical catalog", () => {
    const rows = new Map(
      publicPlanFeatures("en").map((row) => [row.key, row]),
    );
    const publicKeys: Record<EntitlementKey, PublicFeatureKey> = {
      TODAYS_WORKOUT: "recommendations",
      MANUAL_PRACTICE: "manualPractice",
      MASTERY_REVIEW: "mistakeBank",
      FULL_MOCK: "fullMock",
    };

    for (const [entitlement, publicKey] of Object.entries(publicKeys) as Array<
      [EntitlementKey, PublicFeatureKey]
    >) {
      const free = PLAN_CATALOG.FREE.entitlements[entitlement];
      const premium = PLAN_CATALOG.PREMIUM.entitlements[entitlement];
      expect(rows.get(publicKey)?.free).toContain(
        free.type === "LIMITED" ? String(free.count) : "Unlimited",
      );
      expect(premium.type).toBe("UNLIMITED");
      expect(rows.get(publicKey)?.premium).toBe("Unlimited");
    }
  });

  it("publishes enforced capability differences instead of vague Premium copy", () => {
    const rows = new Map(
      publicPlanFeatures("en").map((row) => [row.key, row]),
    );
    expect(rows.get("diagnostic")?.premium).toContain(
      String(DIAGNOSTIC_REASSESSMENT_INTERVAL_DAYS),
    );
    expect(rows.get("progress")?.free).toContain(
      String(PLAN_CAPABILITIES.FREE.historyWindowDays),
    );
    expect(rows.get("progress")?.premium).toContain(
      String(PLAN_CAPABILITIES.PREMIUM.historyWindowDays),
    );
    expect(rows.get("targeting")?.premium).toContain("unseen-first");
  });

  it("renders equivalent EN and VI comparison rows", () => {
    expect(publicPlanFeatures("en").map((row) => row.key)).toEqual(publicPlanFeatures("vi").map((row) => row.key));
  });

  it("discloses reset and shared Mock allowance semantics", () => {
    const notes = publicPlanNotes("en");
    expect(notes.reset).toContain("00:00 Vietnam time");
    expect(notes.reset).toContain("Resuming");
    expect(notes.mock).toContain("share the new-mock allowance");
    expect(notes.mock).toContain("created");
  });
});
