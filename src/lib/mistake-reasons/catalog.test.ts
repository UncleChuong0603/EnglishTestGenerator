import { describe, expect, it } from "vitest";
import { analyzeMistakeReasonPattern } from "./analytics";
import { applicableMistakeReasons, inferMistakeReason, isReasonApplicable, suggestMistakeReasons } from "./catalog";

describe("mistake reason engine", () => {
  it.each([1, 2, 3, 4, 5, 6, 7])("offers safe reasons for Part %i", (part) => {
    expect(applicableMistakeReasons(part).length).toBeGreaterThan(2);
    expect(applicableMistakeReasons(part).every((reason) => isReasonApplicable(reason.code, part))).toBe(true);
  });

  it("keeps listening-only and inference reasons within applicable parts", () => {
    expect(isReasonApplicable("MISHEARD_WORD", 5)).toBe(false);
    expect(isReasonApplicable("MISHEARD_WORD", 2)).toBe(true);
    expect(isReasonApplicable("INFERENCE_ERROR", 7)).toBe(true);
    expect(isReasonApplicable("INFERENCE_ERROR", 5)).toBe(false);
  });

  it("never diagnoses careless and falls back to unknown", () => {
    expect(suggestMistakeReasons({ part: 5, skill: "grammar" })).not.toContain("CARELESS");
    expect(inferMistakeReason()).toEqual({ code: "UNKNOWN", evidenceSource: "SYSTEM_INFERRED" });
  });

  it("does not state a pattern for a small or fragmented sample", () => {
    expect(analyzeMistakeReasonPattern(["VOCAB_UNKNOWN", "VOCAB_UNKNOWN", "GRAMMAR_RULE"])).toMatchObject({ sufficient: false, top: null });
    expect(analyzeMistakeReasonPattern(["VOCAB_UNKNOWN", "GRAMMAR_RULE", "PARAPHRASE_MISSED", "OTHER", "DISTRACTOR_TRAP"])).toMatchObject({ sufficient: false, top: null });
  });

  it("returns an evidence-bounded pattern only after the threshold", () => {
    expect(analyzeMistakeReasonPattern(["VOCAB_UNKNOWN", "VOCAB_UNKNOWN", "VOCAB_UNKNOWN", "GRAMMAR_RULE", "OTHER", "UNKNOWN"]))
      .toEqual({ sampleSize: 5, sufficient: true, top: { code: "VOCAB_UNKNOWN", count: 3, share: 0.6 } });
  });
});
