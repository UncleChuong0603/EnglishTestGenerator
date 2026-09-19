import { describe, expect, it } from "vitest";
import { buildDailyTrend, comparePeriods, productDay } from "./trends";

describe("learner trend aggregation", () => {
  it("uses the product UTC+7 day boundary", () => {
    expect(productDay(new Date("2026-09-18T17:00:00.000Z"))).toBe("2026-09-19");
    expect(productDay(new Date("2026-09-18T16:59:59.999Z"))).toBe("2026-09-18");
  });
  it("keeps inactive days as no data rather than zero percent", () => {
    const points = buildDailyTrend([{ day: "2026-09-19", answeredCount: 1, correctCount: 0 }], 7, new Date("2026-09-19T12:00:00Z"));
    expect(points.at(-1)).toMatchObject({ accuracy: 0, answeredCount: 1 });
    expect(points.at(-2)).toMatchObject({ accuracy: null, answeredCount: 0 });
  });
  it("reports percentage-point change and requires both periods", () => {
    const now = new Date("2026-09-19T12:00:00Z");
    expect(comparePeriods([{ day: "2026-09-18", answeredCount: 3, correctCount: 2 }, { day: "2026-09-10", answeredCount: 2, correctCount: 1 }], 7, now)).toEqual({ currentAccuracy: 67, previousAccuracy: 50, percentagePointChange: 17 });
    expect(comparePeriods([{ day: "2026-09-18", answeredCount: 1, correctCount: 0 }], 7, now).percentagePointChange).toBeNull();
  });
});
