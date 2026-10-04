import { describe, expect, it } from "vitest";
import { normalizeDictation, scoreDictation } from "./scoring";

describe("dictation scoring", () => {
  it("tolerates only formatting differences", () => {
    expect(normalizeDictation("  I’m HERE!\n")).toBe("i'm here");
    expect(scoreDictation("Im here", "I'm here.").exact).toBe(false);
    expect(scoreDictation("I'M HERE", "I'm here.")).toMatchObject({
      exact: true,
      accuracy: 100,
    });
  });

  it("keeps word substitutions strict and reports bounded insight", () => {
    const result = scoreDictation(
      "the train leaves nine",
      "The train leaves at nine.",
    );
    expect(result.exact).toBe(false);
    expect(result.accuracy).toBe(80);
    expect(result.missingWords).toEqual(["at"]);
    expect(result.missingWords.length).toBeLessThanOrEqual(8);
  });
});
