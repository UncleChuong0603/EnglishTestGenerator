import { describe, expect, it } from "vitest";

import { flattenUniqueQuestionIds, selectClosestUnits } from "./selection";

describe("reading practice set selection", () => {
  const noShuffle = () => 0.999;

  it("keeps passage sets intact when a target cannot be exact", () => {
    const units = [
      { id: "a", part: 6 as const, questionIds: ["a1", "a2", "a3", "a4"] },
      { id: "b", part: 6 as const, questionIds: ["b1", "b2", "b3", "b4"] },
      { id: "c", part: 6 as const, questionIds: ["c1", "c2", "c3", "c4"] },
    ];
    const selected = selectClosestUnits(units, 10, noShuffle);
    expect(selected).toHaveLength(3);
    expect(flattenUniqueQuestionIds(selected)).toHaveLength(12);
  });

  it("does not duplicate questions", () => {
    expect(flattenUniqueQuestionIds([
      { id: "a", part: 7, questionIds: ["1", "2"] },
      { id: "b", part: 7, questionIds: ["2", "3"] },
    ])).toEqual(["1", "2", "3"]);
  });
});
