import { describe, expect, it } from "vitest";
import type { PracticeResult, ReviewQuestion } from "@/lib/practice/types";
import { part5ChallengeResult } from "./part-5-result";

function result(questions: ReviewQuestion[]): PracticeResult {
  return {
    id: "00000000-0000-4000-8000-000000000001", mode: "part_5", skillArea: "READING", source: "guest",
    requestedSkill: null, requestedSubSkill: null, requestedQuestionCount: 10,
    scoreCorrect: questions.filter((question) => question.isCorrect).length, scoreTotal: questions.length,
    submittedAt: "2026-09-23T00:00:00.000Z", questions, groups: [],
  };
}

function questions(): ReviewQuestion[] {
  return Array.from({ length: 10 }, (_, index) => ({
    id: `q${index}`, number: index + 1, part: 5 as const, text: "The answer is ____.",
    skill: index < 5 ? "grammar" : "vocabulary", subSkill: `topic_${index % 3}`,
    options: [{ id: `o${index}`, key: "A", text: "correct" }, { id: `w${index}`, key: "B", text: "wrong" }], passageSetId: null,
    selectedOptionId: index < 5 ? `o${index}` : `w${index}`, correctOptionId: `o${index}`,
    isCorrect: index < 5, explanationEn: "Full English explanation.", explanationVi: "Giải thích đầy đủ.",
  }));
}

describe("Part 5 challenge result", () => {
  it("uses submitted answers for 10-question score, accuracy and supported skill signals", () => {
    const insight = part5ChallengeResult(result(questions()));
    expect([insight.correct, insight.total, insight.accuracy]).toEqual([5, 10, 50]);
    expect(insight.skills.map((skill) => [skill.name, skill.correct, skill.attempted, skill.signal])).toEqual([
      ["vocabulary", 0, 5, "needs_work"], ["grammar", 5, 5, "strong"],
    ]);
    expect(insight.mistakes).toHaveLength(5);
    expect(insight.mistakes[0].explanationVi).toBe("Giải thích đầy đủ.");
    expect(insight.subskills.every((item) => item.signal === "early")).toBe(true);
  });

  it("rejects short or mixed-Part sessions before rendering a challenge result", () => {
    expect(() => part5ChallengeResult(result(questions().slice(0, 9)))).toThrow("INVALID_PART_5_CHALLENGE");
    const mixed = result(questions());
    mixed.questions[0].part = 6;
    expect(() => part5ChallengeResult(mixed)).toThrow("INVALID_PART_5_CHALLENGE");
  });

  it("keeps unanswered questions in the score without claiming an unsupported weakness", () => {
    const partial = result(questions().map((question, index) => index < 5 ? question : { ...question, selectedOptionId: null }));
    const insight = part5ChallengeResult(partial);
    expect([insight.correct, insight.total, insight.accuracy]).toEqual([5, 10, 50]);
    expect(insight.skills.find((skill) => skill.name === "vocabulary")?.signal).toBe("early");
    expect(insight.subskills.every((item) => item.answered < 5)).toBe(true);
  });
});
