import { describe, expect, it } from "vitest";
import { getDailyUsageWindow, getMonthlyUsageWindow, getPlanCapabilities, PLAN_CATALOG } from "./catalog";
describe("entitlement catalog and Vietnam usage windows", () => {
  it("uses explicit free limits and unlimited premium", () => { expect(PLAN_CATALOG.FREE.entitlements.MANUAL_PRACTICE).toEqual({ type: "LIMITED", count: 3, period: "DAY" }); expect(PLAN_CATALOG.PREMIUM.entitlements.FULL_MOCK).toEqual({ type: "UNLIMITED" }); });
  it("resets the day at Vietnamese midnight", () => { expect(getDailyUsageWindow(new Date("2026-09-18T16:59:59.999Z"))).toEqual({ start: new Date("2026-09-17T17:00:00.000Z"), resetAt: new Date("2026-09-18T17:00:00.000Z") }); expect(getDailyUsageWindow(new Date("2026-09-18T17:00:00.000Z")).start).toEqual(new Date("2026-09-18T17:00:00.000Z")); });
  it("resets the month at Vietnamese calendar month", () => { expect(getMonthlyUsageWindow(new Date("2026-09-30T17:00:00.000Z"))).toEqual({ start: new Date("2026-09-30T17:00:00.000Z"), resetAt: new Date("2026-10-31T17:00:00.000Z") }); });
  it("keeps useful Free analytics while Premium adds depth", () => {
    expect(getPlanCapabilities("FREE")).toMatchObject({ historyWindowDays: 30, canUseAdvancedAnalytics: false, canUseSkillBreakdown: false, canUseAdvancedMockHistory: false });
    expect(getPlanCapabilities("PREMIUM")).toMatchObject({ historyWindowDays: 90, canUseAdvancedAnalytics: true, canUseSkillBreakdown: true, canUseAdvancedMockHistory: true });
  });
});
