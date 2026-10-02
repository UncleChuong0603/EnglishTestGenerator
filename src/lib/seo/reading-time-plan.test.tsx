import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReadingTimePlanner } from "@/components/seo/reading-time-planner";
import { readingTimePlan } from "./reading-time-plan";

describe("Reading time planning", () => {
  it("keeps the budget at 75 minutes and distinguishes time allocated from time remaining", () => {
    const plan = readingTimePlan(12, 10, 3)!;
    expect(plan.part7).toBe(50);
    expect(plan.checkpoints.map(row => row.remaining)).toEqual([63, 53, 3, 0]);
    expect(plan.checkpoints.reduce((sum, row) => sum + row.minutes, 0)).toBe(75);
    expect(readingTimePlan(10, 8, 0)?.checkpoints.map(row => row.remaining)).toEqual([65, 57, 0, 0]);
    expect(readingTimePlan(10, 8, 3)?.part7).toBe(54);
  });
  it("rejects impossible plans rather than giving Part 7 zero or negative time", () => {
    for (const values of [[0, 10, 3], [12, -1, 3], [12, 10, -1], [35, 35, 5], [40, 40, 3], [12.5, 10, 3], [NaN, 10, 3], [Infinity, 10, 3]]) {
      expect(readingTimePlan(values[0], values[1], values[2])).toBeNull();
    }
  });
  it("server-renders a usable default table, manual formula and localized controls", () => {
    for (const locale of ["vi", "en"] as const) {
      const html = renderToStaticMarkup(<ReadingTimePlanner locale={locale} />);
      expect(html).toContain('id="chia-thoi-gian"');
      expect(html).toContain('<table');
      expect(html).toContain('scope="row"');
      expect(html).toContain("75 − Part 5 − Part 6");
      expect(html).toContain(locale === "vi" ? "Part 7 còn 50 phút" : "Part 7 has 50 minutes");
      expect(html).toContain(locale === "vi" ? "Tính mốc thời gian" : "Calculate checkpoints");
    }
  });
});
