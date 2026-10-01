"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/authorization";
import {
  QUESTION_REPORT_STATUSES,
  QUESTION_REPORT_TYPES,
  updateQuestionIssueReportStatus,
  type QuestionReportStatus,
  type QuestionReportType,
} from "@/lib/admin/question-issue-reports";

export async function updateQuestionReportStatusAction(formData: FormData) {
  const actor = await requireAdmin("CONTENT_MANAGE");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as QuestionReportStatus;
  const returnStatus = String(formData.get("returnStatus") ?? "OPEN") as QuestionReportStatus;
  const issueType = String(formData.get("type") ?? "") as QuestionReportType;
  const part = Number(formData.get("part"));
  const expectedStatus = String(formData.get("expectedStatus") ?? "") as QuestionReportStatus;
  const query = new URLSearchParams({ status: QUESTION_REPORT_STATUSES.includes(returnStatus) ? returnStatus : "OPEN" });
  if (Number.isInteger(part) && part >= 1 && part <= 7) query.set("part", String(part));
  if (QUESTION_REPORT_TYPES.includes(issueType)) query.set("type", issueType);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || !QUESTION_REPORT_STATUSES.includes(status) || !QUESTION_REPORT_STATUSES.includes(expectedStatus)) {
    redirect(`/admin/content/reports?${query}&error=invalid`);
  }
  try {
    await updateQuestionIssueReportStatus(actor.id, id, status, expectedStatus);
  } catch (error) {
    const code = error instanceof Error && error.message === "STALE_REPORT" ? "stale" : "failed";
    redirect(`/admin/content/reports?${query}&error=${code}`);
  }
  revalidatePath("/admin/content/reports");
  redirect(`/admin/content/reports?${query}&updated=1`);
}
