"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/authorization";
import { prepareQuestionReportCorrection, QuestionReportError, updateQuestionReportStatus } from "@/lib/question-reports/service";
import type { QuestionReportStatus } from "@/lib/question-reports/catalog";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "");
const detailPath = (questionId: string, code?: string) => `/admin/content/reports/${encodeURIComponent(questionId)}${code ? `?notice=${encodeURIComponent(code)}` : ""}`;

export async function updateQuestionReportStatusAction(formData: FormData) {
  const actor = await requireAdmin("CONTENT_MANAGE");
  const questionId = value(formData, "questionId");
  const status = value(formData, "status") as Exclude<QuestionReportStatus, "OPEN">;
  try {
    await updateQuestionReportStatus(actor.id, { reportId: value(formData, "reportId"), status, note: value(formData, "note") });
    revalidatePath("/admin/content/reports");
    revalidatePath(detailPath(questionId));
  } catch (error) {
    redirect(detailPath(questionId, error instanceof QuestionReportError ? error.code : "FAILED"));
  }
  redirect(detailPath(questionId, status));
}

export async function prepareQuestionReportCorrectionAction(formData: FormData) {
  const actor = await requireAdmin("CONTENT_MANAGE");
  const questionId = value(formData, "questionId");
  let draft: Awaited<ReturnType<typeof prepareQuestionReportCorrection>>;
  try {
    draft = await prepareQuestionReportCorrection(actor.id, value(formData, "reportId"));
    revalidatePath("/admin/content/reports");
  } catch (error) {
    redirect(detailPath(questionId, error instanceof QuestionReportError ? error.code : "FAILED"));
  }
  redirect(`/admin/content/questions/${encodeURIComponent(draft.groupId)}/edit?question=${encodeURIComponent(draft.questionId)}&fromReport=${encodeURIComponent(questionId)}`);
}
