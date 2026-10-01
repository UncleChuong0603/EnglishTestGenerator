import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { QUESTION_REPORT_DAILY_LIMIT, QUESTION_REPORT_HOURLY_LIMIT, QUESTION_REPORT_REASONS, questionReportLabels } from "./catalog";

const read = (path: string) => readFileSync(path, "utf8");

describe("Task 40 question reporting architecture", () => {
  const service = read("src/lib/question-reports/service.ts");
  const learnerAction = read("src/app/question-reports/actions.ts");
  const learnerControl = read("src/components/practice/question-report-control.tsx");
  const adminActions = read("src/app/admin/content/reports/actions.ts");
  const adminDetail = read("src/app/admin/content/reports/[questionId]/page.tsx");
  const resultCard = read("src/components/practice/answer-review-card.tsx");
  const listeningResult = read("src/app/practice/[sessionId]/results/listening-result.tsx");
  const diagnosticResult = read("src/app/diagnostic/[runId]/result/page.tsx");

  it("supports every required learner category in both interface languages", () => {
    expect(QUESTION_REPORT_REASONS).toEqual(["ANSWER_INCORRECT", "EXPLANATION_ISSUE", "AMBIGUOUS", "TYPO_GRAMMAR", "MEDIA_BROKEN", "OTHER"]);
    for (const reason of QUESTION_REPORT_REASONS) expect(questionReportLabels[reason]).toEqual({ vi: expect.any(String), en: expect.any(String) });
  });

  it("authorizes against a submitted owned session and assigned question", () => {
    expect(service).toContain('eq(practiceSessions.status, "submitted")');
    expect(service).toContain("actorCondition(actor)");
    expect(service).toContain("practiceSessionQuestions.questionId");
    expect(learnerAction).toContain("getCurrentUser()");
    expect(learnerAction).toContain("getGuestOwnerHash()");
  });

  it("sanitizes bounded text and applies duplicate plus rate controls", () => {
    expect(QUESTION_REPORT_HOURLY_LIMIT).toBe(5);
    expect(QUESTION_REPORT_DAILY_LIMIT).toBe(20);
    expect(service).toContain("cleanReportText");
    expect(service).toContain('databaseError.cause?.code === "23505"');
    expect(service).toContain("QUESTION_REPORT_HOURLY_LIMIT");
    expect(service).toContain("QUESTION_REPORT_DAILY_LIMIT");
    expect(learnerControl).toContain("maxLength={QUESTION_REPORT_DESCRIPTION_MAX}");
  });

  it("adds a non-blocking report control only to submitted result surfaces", () => {
    expect(resultCard).toContain("sessionId && reportAction ? <QuestionReportControl");
    expect(listeningResult).toContain("<QuestionReportControl");
    expect(diagnosticResult).toContain("Xem lại và báo lỗi câu hỏi");
    expect(learnerControl).toContain("showModal()");
    expect(learnerControl).toContain("Continue learning");
  });

  it("keeps admin transitions authorized, audited, and tied to the existing editor", () => {
    expect(adminActions).toContain('requireAdmin("CONTENT_MANAGE")');
    expect(service).toContain("QUESTION_REPORT_REVIEW_STARTED");
    expect(service).toContain("QUESTION_REPORT_RESOLVED");
    expect(service).toContain("QUESTION_REPORT_DISMISSED");
    expect(service).toContain("cloneContent(actorUserId");
    expect(adminActions).toContain("/edit?question=");
    expect(adminDetail).toContain("CORRECTION_NOT_PUBLISHED");
    expect(adminDetail).toContain("ORIGINAL_STILL_PUBLISHED");
  });

  it("does not expose learner email or recalculate historical answers", () => {
    expect(service).not.toMatch(/users\.email|profiles\.fullName/);
    expect(service).not.toMatch(/update\(attemptAnswers\)|delete\(attemptAnswers\)/);
    expect(adminDetail).toContain("Submitted scores and correctness are never recalculated");
  });
});
