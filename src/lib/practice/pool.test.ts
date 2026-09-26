import { describe, expect, it } from "vitest";
import { resolveQuestionBankPool } from "./pool";

describe("practice pool rollout", () => {
  it("keeps existing practice on the mock bank while the new bank is being published", () => {
    expect(resolveQuestionBankPool("PRACTICE", false)).toBe("MOCK");
  });

  it("uses the practice bank after isolation is enabled", () => {
    expect(resolveQuestionBankPool("PRACTICE", true)).toBe("PRACTICE");
  });

  it("always keeps full mock selection in the mock bank", () => {
    expect(resolveQuestionBankPool("MOCK", false)).toBe("MOCK");
    expect(resolveQuestionBankPool("MOCK", true)).toBe("MOCK");
  });
});
