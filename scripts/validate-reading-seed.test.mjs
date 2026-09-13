import { describe, expect, it } from "vitest";
import { part5Questions, readingPassageSets } from "./reading-seed-data.mjs";
import { validateReadingSeed } from "./validate-reading-seed.mjs";

describe("TOEIC Reading development seed", () => {
  it("passes structural, taxonomy, distribution, and duplicate validation", () => {
    const { errors, report } = validateReadingSeed();
    expect(errors).toEqual([]);
    expect(report.part).toEqual({ 5: 200, 6: 80, 7: 150 });
    expect(report.passageSets).toEqual({ part6: 20, single: 20, double: 10, triple: 5 });
  });

  it("detects duplicate question and passage text", () => {
    const part5 = structuredClone(part5Questions);
    const sets = structuredClone(readingPassageSets);
    part5[1].text = `  ${part5[0].text.toUpperCase()}  `;
    sets[1].passages[0].content = sets[0].passages[0].content;
    const messages = validateReadingSeed({ part5, sets }).errors.join(" ");
    expect(messages).toContain("duplicate normalized question text");
    expect(messages).toContain("duplicate normalized passage");
  });
});
