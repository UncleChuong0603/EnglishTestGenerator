import { describe, expect, it } from "vitest";
import { learnerContextSchema } from "./domain";

describe("learner context", () => {
  it("accepts optional and partial answers", () => {
    expect(learnerContextSchema.parse({ studyPurpose: "JOB_CAREER", studyPurposeOther: "", acquisitionSource: "", acquisitionSourceOther: "" })).toMatchObject({ studyPurpose: "JOB_CAREER", acquisitionSource: null });
  });
  it("trims OTHER text and clears stale text for normal values", () => {
    expect(learnerContextSchema.parse({ studyPurpose: "OTHER", studyPurposeOther: "  Trường yêu cầu  ", acquisitionSource: "GOOGLE", acquisitionSourceOther: "Facebook" })).toMatchObject({ studyPurposeOther: "Trường yêu cầu", acquisitionSourceOther: null });
  });
  it("rejects unsupported values and long text", () => {
    expect(learnerContextSchema.safeParse({ studyPurpose: "FAKE", acquisitionSource: "" }).success).toBe(false);
    expect(learnerContextSchema.safeParse({ studyPurpose: "OTHER", studyPurposeOther: "x".repeat(121), acquisitionSource: "" }).success).toBe(false);
  });
});
