import { describe, expect, it } from "vitest";
import { funnelRows, periodDays } from "./calculate";
describe("analytics calculations", () => {
  it("calculates funnel conversion and drop-off", () => expect(funnelRows({ landing_viewed: 100, try_viewed: 50, diagnostic_started: 40, diagnostic_completed: 20, signup_completed: 10 }, 5)[1]).toEqual({ count: 50, conversion: 50, dropoff: 50 }));
  it("uses safe period values", () => { expect(periodDays("30d")).toBe("30d"); expect(periodDays("arbitrary")).toBe("7d"); });
});
