import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { analyticsRecommendations, funnelRows, periodDays, productAnalyticsCsv, type ProductAnalyticsSnapshot } from "./calculate";
const snapshot = (overrides: Partial<ProductAnalyticsSnapshot> = {}): ProductAnalyticsSnapshot => ({ events: {}, sessions: 0, questions: 0, active: 0, signups: 0, activated: 0, dau: 0, wau: 0, checkoutCreated: 0, premiumActivated: 0, retention: {}, ...overrides });
describe("analytics calculations", () => {
  it("calculates funnel conversion and drop-off", () => expect(funnelRows({ landing_viewed: 100, try_viewed: 50, diagnostic_started: 40, diagnostic_completed: 20, signup_completed: 10 }, 5)[1]).toEqual({ count: 50, conversion: 50, dropoff: 50 }));
  it("uses safe period values", () => { expect(periodDays("30d")).toBe("30d"); expect(periodDays("arbitrary")).toBe("7d"); });
  it("prioritizes large, sufficiently sampled funnel leaks", () => {
    const items = analyticsRecommendations(snapshot({ events: { landing_viewed: 200, try_viewed: 40, diagnostic_started: 30, diagnostic_completed: 25, signup_completed: 20 }, activated: 18 }));
    expect(items[0]).toMatchObject({ key: "landing_to_try", priority: "high", confidence: "high", value: 80, sample: 200 });
  });
  it("exports an Excel-friendly long-form CSV without personal data", () => {
    const csv = productAnalyticsCsv(snapshot({ events: { landing_viewed: 10 }, signups: 2 }), "7d", "2026-09-20T00:00:00.000Z");
    expect(csv).toContain("section,metric,value,sample,period,generated_at");
    expect(csv).toContain("overview,signups,2,,7d");
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });
  it("protects analytics export with the dashboard permission and private caching", () => {
    const route = readFileSync("src/app/api/admin/analytics-export/route.ts", "utf8");
    expect(route).toContain('requireAdmin("ADMIN_DASHBOARD_READ")');
    expect(route).toContain('"cache-control": "private, no-store"');
  });
});
