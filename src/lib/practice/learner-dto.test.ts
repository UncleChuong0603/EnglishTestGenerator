import { describe, expect, it } from "vitest";
import { toLearnerPracticeQuestion } from "./learner-dto";

describe("learner-safe question DTO", () => {
  it("cannot serialize solutions, explanations, transcripts, or internal metadata", () => {
    const source = { id: "q1", displayOrder: 1, toeicPart: 5, questionText: "Choose.", skill: "grammar", subSkill: "verbs", passageSetId: null, options: [{ id: "o1", optionKey: "A", optionText: "go" }], correctOptionId: "o1", explanationEn: "secret", transcript: "secret", metadata: { internal: true } };
    const dto = toLearnerPracticeQuestion(source);
    expect(dto).toEqual({ id: "q1", number: 1, part: 5, text: "Choose.", skill: "grammar", subSkill: "verbs", passageSetId: null, options: [{ id: "o1", key: "A", text: "go" }] });
    expect(JSON.stringify(dto)).not.toMatch(/correctOption|explanation|transcript|metadata|solution/i);
  });
  it("hides spoken text and privileged Listening fields before submission", () => {
    const dto = toLearnerPracticeQuestion({ id: "q2", displayOrder: 1, toeicPart: 2, questionText: "Where is the station?", skill: "question_response", subSkill: "where", passageSetId: "g1", options: [{ id: "a", optionKey: "A", optionText: "Across the street." }, { id: "b", optionKey: "B", optionText: "At noon." }, { id: "c", optionKey: "C", optionText: "By train." }] });
    expect(dto.text).toBe(""); expect(dto.options.map((o) => o.text)).toEqual(["", "", ""]);
    expect(JSON.stringify(dto)).not.toMatch(/station|street|noon|train|correctOption|transcript|explanation|storageKey|checksum/i);
  });
  it.each([3, 4])("exposes only visible Part %i prompt/options and leaks no review data", (part) => {
    const dto = toLearnerPracticeQuestion({ id: `q${part}`, displayOrder: 1, toeicPart: part, questionText: "What will happen next?", skill: "inference", subSkill: "next_action", passageSetId: "g1", options: ["A","B","C","D"].map((optionKey) => ({ id: optionKey, optionKey, optionText: `Choice ${optionKey}` })), correctOptionId: "A", explanationEn: "secret", transcript: "secret", storageKey: "secret", checksum: "secret" } as Parameters<typeof toLearnerPracticeQuestion>[0]);
    expect(dto.text).toBe("What will happen next?"); expect(dto.options).toHaveLength(4); expect(JSON.stringify(dto)).not.toMatch(/correctOption|transcript|explanation|storageKey|checksum|solution|isCorrect/i);
  });
});
