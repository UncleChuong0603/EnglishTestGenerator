import { describe, expect, it } from "vitest";
import { FREE_WEEKLY_PLAN_PREVIEW_COUNT, getDailyUsageWindow, getMonthlyUsageWindow, getPlanCapabilities, PLAN_CATALOG } from "./catalog";
describe("entitlement catalog and Vietnam usage windows", () => {
  it("supports a daily Free habit and reserves unlimited usage for Premium", () => {
    expect(PLAN_CATALOG.FREE.entitlements).toEqual({
      TODAYS_WORKOUT: { type: "LIMITED", count: 1, period: "DAY" },
      MANUAL_PRACTICE: { type: "LIMITED", count: 5, period: "DAY" },
      MASTERY_REVIEW: { type: "LIMITED", count: 2, period: "DAY" },
      FULL_MOCK: { type: "LIMITED", count: 4, period: "MONTH" },
    });
    expect(Object.values(PLAN_CATALOG.PREMIUM.entitlements).every(value => value.type === "UNLIMITED")).toBe(true);
    expect(FREE_WEEKLY_PLAN_PREVIEW_COUNT).toBe(7);
  });
  it("resets the day at Vietnamese midnight", () => { expect(getDailyUsageWindow(new Date("2026-09-18T16:59:59.999Z"))).toEqual({ start: new Date("2026-09-17T17:00:00.000Z"), resetAt: new Date("2026-09-18T17:00:00.000Z") }); expect(getDailyUsageWindow(new Date("2026-09-18T17:00:00.000Z")).start).toEqual(new Date("2026-09-18T17:00:00.000Z")); });
  it("resets the month at Vietnamese calendar month", () => { expect(getMonthlyUsageWindow(new Date("2026-09-30T17:00:00.000Z"))).toEqual({ start: new Date("2026-09-30T17:00:00.000Z"), resetAt: new Date("2026-10-31T17:00:00.000Z") }); });
  it("keeps useful Free analytics while Premium adds depth", () => {
    expect(getPlanCapabilities("FREE")).toMatchObject({ historyWindowDays: 30, canUseSkillBreakdown: false, canUseAdvancedMockHistory: false });
    expect(getPlanCapabilities("PREMIUM")).toMatchObject({ historyWindowDays: 90, canUseSkillBreakdown: true, canUseAdvancedMockHistory: true });
  });
});
