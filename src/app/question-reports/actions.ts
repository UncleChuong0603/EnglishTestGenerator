"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getGuestOwnerHash } from "@/lib/guest/identity";
import { QUESTION_REPORT_REASONS, type QuestionReportFormState, type QuestionReportReason } from "@/lib/question-reports/catalog";
import { createQuestionReport, QuestionReportError } from "@/lib/question-reports/service";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function submitQuestionReportAction(_previous: QuestionReportFormState, formData: FormData): Promise<QuestionReportFormState> {
  const [user, guestOwnerHash] = await Promise.all([getCurrentUser(), getGuestOwnerHash()]);
  if (!user && !guestOwnerHash) return { status: "error", code: "AUTH_REQUIRED" };
  const reason = value(formData, "reason");
  if (!QUESTION_REPORT_REASONS.includes(reason as QuestionReportReason)) return { status: "error", code: "INVALID_INPUT" };
  try {
    await createQuestionReport(user ? { userId: user.id } : { guestOwnerHash: guestOwnerHash! }, {
      sessionId: value(formData, "sessionId"),
      questionId: value(formData, "questionId"),
      reason: reason as QuestionReportReason,
      description: value(formData, "description"),
    });
    return { status: "success" };
  } catch (error) {
    if (error instanceof QuestionReportError) return { status: "error", code: error.code };
    console.error("Could not create question report", error);
    return { status: "error", code: "FAILED" };
  }
}
