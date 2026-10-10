"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createMockRun, finalizeFullMockSection, saveFullMockAnswer } from "@/lib/full-mock/service";
import type { MockMode } from "@/lib/full-mock/blueprint";
import { UsageLimitError } from "@/lib/entitlements/service";
import { isShortMockDifficulty } from "@/lib/short-mock/config";
import { createShortMockSession } from "@/lib/short-mock/service";

export async function startMock(mode: MockMode, formData?: FormData) { const user = await requireUser(); if (!["LISTENING","READING","FULL"].includes(mode)) redirect("/full-mock?unavailable=1"); const rawFormNumber = formData?.get("formNumber"); const formNumber = typeof rawFormNumber === "string" ? Number(rawFormNumber) : undefined; if (formNumber !== undefined && (!Number.isInteger(formNumber) || formNumber < 1 || formNumber > 25)) redirect("/full-mock?unavailable=1"); try { const result = await createMockRun(user.id, mode, formNumber); if (!result.ok) redirect("/full-mock?unavailable=1"); redirect(`/full-mock/${result.runId}`); } catch (error) { if (typeof error === "object" && error && "digest" in error) throw error; if (error instanceof UsageLimitError) redirect(`/full-mock?error=usage_limit&resetAt=${encodeURIComponent(error.status.resetAt)}`); throw error; } }
export const startFullMock = startMock.bind(null, "FULL");
export async function startShortMock(formData: FormData) {
  const user = await requireUser();
  const difficulty = formData.get("difficulty");
  if (!isShortMockDifficulty(difficulty)) redirect("/full-mock?shortError=invalid_level#short-mock");
  try {
    redirect(`/practice/${await createShortMockSession(user.id, difficulty)}`);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    if (error instanceof UsageLimitError) {
      redirect(`/full-mock?shortError=usage_limit&resetAt=${encodeURIComponent(error.status.resetAt)}#short-mock`);
    }
    console.error("Could not start short mock", error);
    redirect(`/full-mock?shortError=${error instanceof Error && error.message === "SHORT_MOCK_CONTENT_NOT_READY" ? "content_not_ready" : "start_failed"}#short-mock`);
  }
}
export async function saveMockAnswer(runId: string, sessionId: string, questionId: string, form: FormData) { const user = await requireUser(); const optionId = form.get("optionId"); if (typeof optionId !== "string") return; await saveFullMockAnswer({ runId, sessionId, questionId, optionId, userId: user.id }); }
export async function finishMockSection(runId: string) { const user = await requireUser(); const result = await finalizeFullMockSection(runId, user.id); if (result.ok && result.status === "COMPLETED") redirect(`/full-mock/${runId}/results`); redirect(`/full-mock/${runId}`); }
