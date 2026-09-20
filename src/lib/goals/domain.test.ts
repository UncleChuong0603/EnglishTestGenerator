import { describe, expect, it } from "vitest";
import { DAILY_STUDY_MINUTES, STUDY_DAYS_PER_WEEK, TARGET_SCORE_PRESETS, daysUntilExam, formatExamDate, parseGoalProfile } from "./domain";

const valid = { targetScore: 750, examDate: "2026-12-20", dailyStudyMinutes: 20, studyDaysPerWeek: 5 };

describe("learner goal domain", () => {
  it("keeps supported choices centralized", () => {
    expect(TARGET_SCORE_PRESETS).toEqual([450, 550, 650, 750, 850]);
    expect(DAILY_STUDY_MINUTES).toEqual([10, 20, 30, 45, 60]);
    expect(STUDY_DAYS_PER_WEEK).toEqual([3, 5, 7]);
  });
  it.each([450, 750, 990, 10])("accepts legitimate target %s", targetScore => {
    expect(parseGoalProfile({ ...valid, targetScore }, "2026-09-20").success).toBe(true);
  });
  it.each([5, 991, 752])("rejects invalid target %s", targetScore => {
    expect(parseGoalProfile({ ...valid, targetScore }, "2026-09-20").success).toBe(false);
  });
  it.each([0, 15, 90])("rejects invalid daily minutes %s", dailyStudyMinutes => {
    expect(parseGoalProfile({ ...valid, dailyStudyMinutes }, "2026-09-20").success).toBe(false);
  });
  it.each([0, 4, 8])("rejects invalid study days %s", studyDaysPerWeek => {
    expect(parseGoalProfile({ ...valid, studyDaysPerWeek }, "2026-09-20").success).toBe(false);
  });
  it("supports optional fields and clearing the exam date", () => {
    expect(parseGoalProfile({ targetScore: "", examDate: "", dailyStudyMinutes: "", studyDaysPerWeek: "" }, "2026-09-20")).toMatchObject({ success: true, data: { targetScore: null, examDate: null, dailyStudyMinutes: null, studyDaysPerWeek: null } });
  });
  it("rejects invalid and historical dates for new updates", () => {
    expect(parseGoalProfile({ ...valid, examDate: "2026-02-30" }, "2026-09-20").success).toBe(false);
    expect(parseGoalProfile({ ...valid, examDate: "2026-09-19" }, "2026-09-20").success).toBe(false);
  });
  it("formats a DATE without shifting timezones and calculates whole days", () => {
    expect(formatExamDate("2026-12-20", "vi")).toBe("20/12/2026");
    expect(daysUntilExam("2026-12-20", "2026-12-18")).toBe(2);
    expect(daysUntilExam("2026-12-17", "2026-12-18")).toBe(-1);
  });
});
