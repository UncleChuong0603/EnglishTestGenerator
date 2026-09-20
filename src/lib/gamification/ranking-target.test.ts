import { describe, expect, it } from "vitest";
import { nextRankTarget } from "./ranking";

describe("next rank target", () => {
  const rows = [
    {score: 190, rank: 1},
    {score: 190, rank: 1},
    {score: 160, rank: 3},
    {score: 140, rank: 4},
    {score: 140, rank: 4},
  ];
  it("does not offer a target to tied leaders", () => {
    expect(nextRankTarget(rows, rows[1])).toBeNull();
  });
  it("skips peers tied with the learner and uses competition rank", () => {
    expect(nextRankTarget(rows, rows[4])).toEqual({rank: 3, score: 160, points: 21});
  });
  it("requires beating, not merely tying, the next score", () => {
    expect(nextRankTarget(rows, rows[2])).toEqual({rank: 1, score: 190, points: 31});
  });
});
