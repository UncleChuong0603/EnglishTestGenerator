import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/lib/practice/recommendation.ts", "utf8");

describe("recommendation availability", () => {
  it("does not make a transient recommendation query failure fatal", () => {
    expect(source).toContain("for (let attempt = 0; attempt < 2; attempt += 1)");
    expect(source).toContain("if (!available) return defaultRecommendation()");
  });

  it("skips the question-bank request when the learner has too little evidence", () => {
    expect(source).toContain("if (!levels.some");
    expect(source).toContain("return defaultRecommendation()");
  });
});
