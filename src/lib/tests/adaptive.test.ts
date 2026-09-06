import { describe, expect, it } from "vitest";
import { selectAdaptiveQuestions } from "./adaptive";
import { skills, type QuestionCandidate } from "./types";

const candidates: QuestionCandidate[] = skills.flatMap((skill, skillIndex) =>
  Array.from({ length: 6 }, (_, index) => ({
    id: `${skillIndex}-${index}`,
    passageId: `${skillIndex}`,
    skill,
    previousUses: index,
  })),
);

describe("adaptive question selection", () => {
  it("keeps all core skills represented", () => {
    const selected = selectAdaptiveQuestions(candidates, [], 10, "learner-1");
    expect(selected).toHaveLength(10);
    expect(new Set(selected.map((question) => question.skill))).toEqual(new Set(skills));
  });

  it("prioritizes a lower-accuracy skill without letting it dominate", () => {
    const history = skills.map((skill) => ({ skill, correct: skill === "inference" ? 0 : 10, total: 10 }));
    const selected = selectAdaptiveQuestions(candidates, history, 10, "learner-2");
    const inferenceCount = selected.filter((question) => question.skill === "inference").length;
    expect(inferenceCount).toBeGreaterThan(1);
    expect(inferenceCount).toBeLessThanOrEqual(4);
  });

  it("returns the same selection for the same seed", () => {
    expect(selectAdaptiveQuestions(candidates, [], 10, "stable")).toEqual(selectAdaptiveQuestions(candidates, [], 10, "stable"));
  });
});
