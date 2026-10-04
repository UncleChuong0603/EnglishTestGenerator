import { describe, expect, it } from "vitest";
import { applyMasteryEvidence } from "@/lib/mastery/state";
import {
  chooseRemediationEvidenceQuestion,
  rankFocusedRemediationUnits,
  remediationStage,
  selectFocusedRemediationUnits,
} from "./policy";

const history = {
  seenQuestionIds: new Set(["old-1", "recent-1"]),
  recentQuestionIds: new Set(["recent-1"]),
};

describe("learning remediation policy", () => {
  it("shows the canonical three-stage mastery progression", () => {
    const initial = { status: "UNRESOLVED" as const, reviewAttemptCount: 0, reviewSuccessStreak: 0 };
    expect(remediationStage(initial.status, initial.reviewSuccessStreak)).toBe("NEEDS_REVIEW");
    const firstCorrect = applyMasteryEvidence(initial, "review", true);
    expect(remediationStage(firstCorrect.status, firstCorrect.reviewSuccessStreak)).toBe("STRENGTHENING");
    const secondCorrect = applyMasteryEvidence(firstCorrect, "review", true);
    expect(remediationStage(secondCorrect.status, secondCorrect.reviewSuccessStreak)).toBe("MASTERED");
    const reopened = applyMasteryEvidence(secondCorrect, "review", false);
    expect(remediationStage(reopened.status, reopened.reviewSuccessStreak)).toBe("NEEDS_REVIEW");
  });

  it("keeps repeated ordinary misses in review without inventing mastery progress", () => {
    const initial = { status: "UNRESOLVED" as const, reviewAttemptCount: 0, reviewSuccessStreak: 0 };
    const firstMiss = applyMasteryEvidence(initial, "normal", false);
    const repeatedMiss = applyMasteryEvidence(firstMiss, "normal", false);
    expect(repeatedMiss).toEqual(initial);
    expect(remediationStage(repeatedMiss.status, repeatedMiss.reviewSuccessStreak)).toBe("NEEDS_REVIEW");
  });

  it("prefers unseen, then older, then recent and excludes the source unit", () => {
    const units = [
      { id: "source", part: 5, questionIds: ["source"] },
      { id: "recent", part: 5, questionIds: ["recent-1"] },
      { id: "old", part: 5, questionIds: ["old-1"] },
      { id: "unseen", part: 5, questionIds: ["unseen-1"] },
    ];
    expect(rankFocusedRemediationUnits(units, history, "source").map((unit) => unit.id)).toEqual([
      "unseen",
      "old",
      "recent",
    ]);
  });

  it.each([
    [3, ["p3-1", "p3-2", "p3-3"]],
    [4, ["p4-1", "p4-2", "p4-3"]],
    [6, ["p6-1", "p6-2", "p6-3", "p6-4"]],
    [7, ["p7-1", "p7-2", "p7-3"]],
  ])("keeps Part %i remediation groups intact", (part, questionIds) => {
    const [selected] = rankFocusedRemediationUnits(
      [{ id: `group-${part}`, part, questionIds }],
      { seenQuestionIds: new Set(), recentQuestionIds: new Set() },
      "source-group",
    );
    expect(selected.questionIds).toEqual(questionIds);
  });

  it("uses only an exact real taxonomy match as mastery evidence", () => {
    const questions = [
      { id: "recent-1", skill: "grammar", subSkill: "word_form" },
      { id: "unseen-1", skill: "grammar", subSkill: "word_form" },
      { id: "other", skill: "grammar", subSkill: "tense" },
    ];
    expect(chooseRemediationEvidenceQuestion(questions, history, { skill: "grammar", subSkill: "word_form" })?.id).toBe("unseen-1");
    expect(chooseRemediationEvidenceQuestion(questions, history, { skill: "vocabulary", subSkill: "meaning" })).toBeNull();
  });

  it("returns no replacement when only the source unit exists", () => {
    expect(rankFocusedRemediationUnits(
      [{ id: "source", part: 5, questionIds: ["source"] }],
      { seenQuestionIds: new Set(), recentQuestionIds: new Set() },
      "source",
    )).toEqual([]);
  });

  it("builds a 3–5 question drill without splitting grouped units", () => {
    expect(selectFocusedRemediationUnits([
      { id: "a", part: 5, questionIds: ["1"] },
      { id: "b", part: 5, questionIds: ["2"] },
      { id: "c", part: 5, questionIds: ["3"] },
      { id: "d", part: 5, questionIds: ["4"] },
      { id: "e", part: 5, questionIds: ["5"] },
      { id: "f", part: 5, questionIds: ["6"] },
    ]).flatMap((unit) => unit.questionIds)).toEqual(["1", "2", "3"]);
    expect(selectFocusedRemediationUnits([
      { id: "p6", part: 6, questionIds: ["1", "2", "3", "4"] },
      { id: "extra", part: 6, questionIds: ["5", "6", "7", "8"] },
    ])).toEqual([{ id: "p6", part: 6, questionIds: ["1", "2", "3", "4"] }]);
    expect(selectFocusedRemediationUnits([
      { id: "too-small", part: 5, questionIds: ["1", "2"] },
    ])).toEqual([]);
  });
});
