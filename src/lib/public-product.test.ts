import { describe, expect, it } from "vitest";
import { PLAN_CATALOG } from "@/lib/entitlements/catalog";
import { PUBLIC_ACTIVATION_HREF, publicPlanFeatures } from "./public-product";

describe("public activation configuration", () => {
  it("routes the public primary action to guest practice", () => {
    expect(PUBLIC_ACTIVATION_HREF).toBe("/try");
  });

  it("derives public quotas from the entitlement catalog", () => {
    const rows = publicPlanFeatures("en");
    const recommendations = rows.find((row) => row.key === "recommendations");
    const mistakes = rows.find((row) => row.key === "mistakeBank");
    expect(recommendations?.free).toBe(`${PLAN_CATALOG.FREE.entitlements.TODAYS_WORKOUT.type === "LIMITED" ? PLAN_CATALOG.FREE.entitlements.TODAYS_WORKOUT.count : "Unlimited"}/day`);
    expect(mistakes?.premium).toBe("Unlimited");
  });

  it("renders equivalent EN and VI comparison rows", () => {
    expect(publicPlanFeatures("en").map((row) => row.key)).toEqual(publicPlanFeatures("vi").map((row) => row.key));
  });
});
