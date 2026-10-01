export const QUESTION_REPORT_REASONS = [
  "ANSWER_INCORRECT",
  "EXPLANATION_ISSUE",
  "AMBIGUOUS",
  "TYPO_GRAMMAR",
  "MEDIA_BROKEN",
  "OTHER",
] as const;

export type QuestionReportReason = (typeof QUESTION_REPORT_REASONS)[number];

export const QUESTION_REPORT_STATUSES = ["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"] as const;
export type QuestionReportStatus = (typeof QUESTION_REPORT_STATUSES)[number];

export const QUESTION_REPORT_DESCRIPTION_MAX = 500;
export const QUESTION_REPORT_NOTE_MAX = 1000;
export const QUESTION_REPORT_HOURLY_LIMIT = 5;
export const QUESTION_REPORT_DAILY_LIMIT = 20;
export type QuestionReportFormState = { status: "idle" | "success" | "error"; code?: string };

export const questionReportLabels: Record<QuestionReportReason, { vi: string; en: string }> = {
  ANSWER_INCORRECT: { vi: "Đáp án có thể sai", en: "The answer may be incorrect" },
  EXPLANATION_ISSUE: { vi: "Giải thích sai hoặc khó hiểu", en: "The explanation is incorrect or unclear" },
  AMBIGUOUS: { vi: "Câu hỏi mơ hồ", en: "The question is ambiguous" },
  TYPO_GRAMMAR: { vi: "Lỗi chính tả hoặc ngữ pháp", en: "Spelling or grammar issue" },
  MEDIA_BROKEN: { vi: "Audio hoặc hình ảnh lỗi", en: "Broken audio or image" },
  OTHER: { vi: "Vấn đề khác", en: "Another issue" },
};

export const questionReportStatusLabels: Record<QuestionReportStatus, { vi: string; en: string }> = {
  OPEN: { vi: "Mới", en: "Open" },
  IN_REVIEW: { vi: "Đang kiểm tra", en: "In review" },
  RESOLVED: { vi: "Đã xử lý", en: "Resolved" },
  DISMISSED: { vi: "Đã bác bỏ", en: "Dismissed" },
};
