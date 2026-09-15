import { describe, expect, it } from "vitest";
import { isValidSkillPart, skillAreaForPart, validateQuestionGroup } from "./domain";

describe("TOEIC domain rules", () => {
  it.each([1, 2, 3, 4])("accepts Listening Part %i", (part) => expect(isValidSkillPart("LISTENING", part)).toBe(true));
  it.each([5, 6, 7])("rejects Listening Part %i", (part) => expect(isValidSkillPart("LISTENING", part)).toBe(false));
  it.each([5, 6, 7])("accepts Reading Part %i", (part) => expect(isValidSkillPart("READING", part)).toBe(true));
  it.each([1, 2, 3, 4])("rejects Reading Part %i", (part) => expect(isValidSkillPart("READING", part)).toBe(false));
  it("owns every V1 part centrally", () => { expect(skillAreaForPart(2)).toBe("LISTENING"); expect(skillAreaForPart(7)).toBe("READING"); });
  it("validates structural Listening groups", () => {
    expect(validateQuestionGroup({ id: "g", skillArea: "LISTENING", part: 3, stimuli: [{ type: "AUDIO", media: { assetId: "a", kind: "CONTENT_AUDIO" } }], questionIds: ["q1", "q2"] })).toBe(true);
    expect(validateQuestionGroup({ id: "g", skillArea: "LISTENING", part: 3, stimuli: [], questionIds: ["q1", "q2"] })).toBe(false);
  });
});
