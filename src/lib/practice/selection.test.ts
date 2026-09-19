import { describe, expect, it } from "vitest";

import { contentHistoryRank, flattenUniqueQuestionIds, rankPreferUnseen, rankSelectionUnits, RECENT_CONTENT_SESSION_WINDOW, selectClosestUnits } from "./selection";

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

  it("defines recency centrally as the latest ten submitted sessions", () => {
    expect(RECENT_CONTENT_SESSION_WINDOW).toBe(10);
  });

  it("prefers unseen content and can reuse older content before recent content", () => {
    const units = [
      { id: "recent", part: 1, questionIds: ["q1"] },
      { id: "old", part: 1, questionIds: ["q2"] },
      { id: "unseen", part: 1, questionIds: ["q3"] },
    ];
    const history = { seenQuestionIds: new Set(["q1", "q2"]), recentQuestionIds: new Set(["q1"]) };
    expect(rankSelectionUnits(units, history).map((unit) => unit.id)).toEqual(["unseen", "old", "recent"]);
  });

  it("defines prefer-unseen fallback deterministically without splitting units", () => {
    const units = [
      { id: "recent-group", part: 7, questionIds: ["r1", "r2", "r3"] },
      { id: "old-group", part: 7, questionIds: ["o1", "o2"] },
      { id: "unseen-group", part: 7, questionIds: ["u1", "u2"] },
    ];
    const history = { seenQuestionIds: new Set(["r1", "o1"]), recentQuestionIds: new Set(["r1"]) };
    expect(rankPreferUnseen(units, history).map((unit) => unit.id)).toEqual(["unseen-group", "old-group", "recent-group"]);
    expect(flattenUniqueQuestionIds(selectClosestUnits(rankPreferUnseen(units, history), 4, () => 0.999))).toEqual(["u1", "u2", "o1", "o2"]);
  });

  it("deprioritizes a complete group when any child was recent", () => {
    const group = { id: "conversation", part: 3, questionIds: ["q1", "q2", "q3"] };
    expect(contentHistoryRank(group, { seenQuestionIds: new Set(["q2"]), recentQuestionIds: new Set(["q2"]) })).toBe(2);
  });

  it("uses relevance while allowing a recent exact target to fall behind fresh support", () => {
    const units = [
      { id: "exact-recent", part: 3, questionIds: ["q1"], relevance: 3 },
      { id: "support-unseen", part: 3, questionIds: ["q2"], relevance: 2 },
    ];
    const ranked = rankSelectionUnits(units, { seenQuestionIds: new Set(["q1"]), recentQuestionIds: new Set(["q1"]) }, (unit) => unit.relevance);
    expect(ranked[0].id).toBe("support-unseen");
  });
});
