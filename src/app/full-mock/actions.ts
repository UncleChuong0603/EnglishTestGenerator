"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createFullMock, finalizeFullMockSection, saveFullMockAnswer } from "@/lib/full-mock/service";
import { UsageLimitError } from "@/lib/entitlements/service";

export async function startFullMock() { const user = await requireUser(); try { const result = await createFullMock(user.id); if (!result.ok) redirect("/full-mock?unavailable=1"); redirect(`/full-mock/${result.runId}`); } catch (error) { if (typeof error === "object" && error && "digest" in error) throw error; if (error instanceof UsageLimitError) redirect(`/full-mock?error=usage_limit&resetAt=${encodeURIComponent(error.status.resetAt)}`); throw error; } }
export async function saveMockAnswer(runId: string, sessionId: string, questionId: string, form: FormData) { const user = await requireUser(); const optionId = form.get("optionId"); if (typeof optionId !== "string") return; await saveFullMockAnswer({ runId, sessionId, questionId, optionId, userId: user.id }); }
export async function finishMockSection(runId: string) { const user = await requireUser(); const result = await finalizeFullMockSection(runId, user.id); if (result.ok && result.status === "COMPLETED") redirect(`/full-mock/${runId}/results`); redirect(`/full-mock/${runId}`); }
