import { describe, expect, it } from "vitest";
import { recommendContentCoverage, type ContentCoverage } from "./content-coverage";

const row = (part: number, groups: number, questions: number, targetGroups: number, targetQuestions: number): ContentCoverage => ({ part, label: `Part ${part}`, groups, questions, targetGroups, targetQuestions });

describe("admin content coverage recommendations", () => {
  it("prioritizes the lowest structural coverage and limits the result", () => {
    const result = recommendContentCoverage([row(1, 3, 3, 6, 6), row(2, 20, 20, 25, 25), row(3, 2, 6, 13, 39), row(4, 8, 24, 10, 30)]);
    expect(result.map((item) => item.part)).toEqual([3, 1, 4]);
  });
  it("does not recommend coverage that already meets or exceeds the blueprint", () => {
    expect(recommendContentCoverage([row(5, 35, 35, 30, 30)])).toEqual([]);
  });
  it("uses both group and question requirements for grouped content", () => {
    const [result] = recommendContentCoverage([row(7, 10, 20, 10, 29)]);
    expect(result.coverage).toBeCloseTo(20 / 29);
    expect(result.groupDeficit).toBe(0);
    expect(result.questionDeficit).toBe(9);
  });
});
