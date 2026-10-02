import { describe, expect, it } from "vitest";
import { summarizeToeicScore } from "./toeic-score";

describe("TOEIC scaled score summary", () => {
  it("adds the two official section scores and reports the target gap", () => {
    expect(summarizeToeicScore(355, 310, 700)).toEqual({ total: 665, gap: 35, reachedTarget: false });
    expect(summarizeToeicScore(400, 350, 700)).toEqual({ total: 750, gap: 0, reachedTarget: true });
  });

  it("rejects values outside the official Listening and Reading ranges", () => {
    expect(summarizeToeicScore(0, 300, 650)).toBeNull();
    expect(summarizeToeicScore(500, 300, 650)).toBeNull();
    expect(summarizeToeicScore(300.5, 300, 650)).toBeNull();
    expect(summarizeToeicScore(300, 300, 1000)).toBeNull();
  });
});
