import { describe, expect, it } from "vitest";
import { validateGeneratedTest } from "./schema";

function question(order: number) {
  return {
    order,
    question: `What does question ${order} ask?`,
    options: [
      { key: "A", text: "First" }, { key: "B", text: "Second" },
      { key: "C", text: "Third" }, { key: "D", text: "Fourth" },
    ],
    correctAnswer: "A",
    explanation: "The passage directly supports the first option.",
    skill: "detail",
    subSkill: "factual comprehension",
    difficulty: "B1",
  };
}

const validTest = {
  title: "A practical reading test",
  passage: "A sufficiently detailed original reading passage. ".repeat(12),
  questions: Array.from({ length: 10 }, (_, index) => question(index + 1)),
};

describe("generated reading test validation", () => {
  it("accepts a complete sequential test", () => {
    expect(validateGeneratedTest(validTest, 10).success).toBe(true);
  });

  it("rejects duplicate option keys", () => {
    const invalid = structuredClone(validTest);
    invalid.questions[0].options[1].key = "A";
    expect(validateGeneratedTest(invalid, 10).success).toBe(false);
  });

  it("rejects the wrong number of questions", () => {
    expect(validateGeneratedTest(validTest, 20).success).toBe(false);
  });
});
