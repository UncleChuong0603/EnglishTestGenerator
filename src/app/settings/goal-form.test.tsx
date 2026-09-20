import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("./goal-actions", () => ({ saveGoal: vi.fn() }));
import { GoalForm } from "./goal-form";

describe("GoalForm", () => {
  it("renders the no-goal state with accessible groups and skip", () => {
    const html = renderToStaticMarkup(<GoalForm goal={null} locale="en" />);
    expect(html).toContain("Target TOEIC score");
    expect(html).toContain("Expected test date");
    expect(html).toContain("Study time per day");
    expect(html).toContain("Study days per week");
    expect(html).toContain("Skip for now");
  });
  it("renders existing Vietnamese values for editing", () => {
    const html = renderToStaticMarkup(<GoalForm goal={{ targetScore: 750, examDate: "2026-12-20", dailyStudyMinutes: 20, studyDaysPerWeek: 5, updatedAt: "2026-09-20T00:00:00.000Z" }} locale="vi" />);
    expect(html).toContain("Mục tiêu TOEIC");
    expect(html).toContain('value="2026-12-20"');
    expect(html).toContain("Lưu mục tiêu");
    expect(html).not.toContain("Bỏ qua lúc này");
  });
});
