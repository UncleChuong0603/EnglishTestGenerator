import { describe, expect, it } from "vitest";
import { evaluateMultipleChoice, responseMatchesType } from "./evaluation";

describe("response and evaluation", () => {
  it("scores multiple-choice responses deterministically", () => {
    expect(evaluateMultipleChoice({ type: "MULTIPLE_CHOICE", selectedOptionId: "b" }, "b")).toEqual({ method: "DETERMINISTIC", status: "COMPLETED", isCorrect: true });
    expect(evaluateMultipleChoice({ type: "MULTIPLE_CHOICE", selectedOptionId: null }, "b").isCorrect).toBe(false);
  });
  it("rejects unsupported and mismatched response combinations", () => {
    expect(responseMatchesType("MULTIPLE_CHOICE", { type: "TEXT", text: "answer" })).toBe(false);
    expect(responseMatchesType("TEXT", { type: "TEXT", text: "answer" })).toBe(false);
    expect(responseMatchesType("AUDIO", { type: "AUDIO", mediaAssetId: "asset" })).toBe(false);
  });
});
