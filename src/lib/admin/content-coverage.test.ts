import { describe, expect, it } from "vitest";
import {
  calculateContentCoverage,
  getQuestionBankCapacity,
  recommendContentCoverage,
  type ContentCoverage,
} from "./content-coverage";

const row = (part: number, groups: number, questions: number, groupsPerForm: number, questionsPerForm: number): ContentCoverage => ({ part, label: `Part ${part}`, groups, questions, groupsPerForm, questionsPerForm });

describe("admin content coverage recommendations", () => {
  it("prioritizes growth against a multi-form bank target", () => {
    const result = recommendContentCoverage([row(1, 30, 30, 6, 6), row(2, 200, 200, 25, 25), row(3, 26, 78, 13, 39), row(4, 80, 240, 10, 30)]);
    expect(result.map((item) => item.part)).toEqual([3, 1, 4]);
    expect(result[0].targetQuestions).toBe(390);
  });
  it("does not recommend coverage that meets the bank-size target", () => {
    expect(recommendContentCoverage([row(5, 300, 300, 30, 30)])).toEqual([]);
  });
  it("uses the admin-configured target instead of the default", () => {
    const [result] = recommendContentCoverage([row(5, 300, 300, 30, 30)], 20);
    expect(result.targetForms).toBe(20);
    expect(result.targetQuestions).toBe(600);
    expect(result.questionDeficit).toBe(300);
    expect(result.coverage).toBe(0.5);
  });
  it("uses both group and question requirements for grouped content", () => {
    const result = calculateContentCoverage(row(7, 100, 200, 10, 29));
    expect(result.coverage).toBeCloseTo(200 / 290);
    expect(result.groupDeficit).toBe(0);
    expect(result.questionDeficit).toBe(90);
    expect(result.uniqueFormCapacity).toBe(6);
  });
  it("reports the weakest Part as the no-repeat full-mock capacity", () => {
    expect(getQuestionBankCapacity([row(1, 18, 18, 6, 6), row(2, 50, 50, 25, 25), row(3, 52, 156, 13, 39)])).toBe(2);
  });
});
