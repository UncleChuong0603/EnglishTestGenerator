import { describe, expect, it } from "vitest";
import { formatBreakdownMetric } from "./presentation";

describe("progress breakdown presentation", () => {
  it("shows answer progress below five attempts, even for a perfect result", () => {
    expect(formatBreakdownMetric({ accuracy: 100, attemptedCount: 2 }, "vi"))
      .toBe("Đã làm 2/5 câu");
    expect(formatBreakdownMetric({ accuracy: 100, attemptedCount: 2 }, "en"))
      .toBe("2/5 answers");
  });

  it("shows accuracy once the individual area reaches five attempts", () => {
    expect(formatBreakdownMetric({ accuracy: 60, attemptedCount: 5 }, "vi"))
      .toBe("60% · 5 câu");
    expect(formatBreakdownMetric({ accuracy: 60, attemptedCount: 5 }, "en"))
      .toBe("60% · 5 answers");
  });
});
