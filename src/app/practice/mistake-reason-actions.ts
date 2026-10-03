"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import type { MistakeReasonCode } from "@/lib/mistake-reasons/catalog";
import { MistakeReasonError, saveUserMistakeReason } from "@/lib/mistake-reasons/service";

export type MistakeReasonFormState = { status: "idle" } | { status: "success"; selected: MistakeReasonCode } | { status: "error"; code: "INVALID" | "NOT_ALLOWED" | "AUTH_REQUIRED" | "FAILED" };

export async function saveMistakeReasonAction(_previous: MistakeReasonFormState, formData: FormData): Promise<MistakeReasonFormState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", code: "AUTH_REQUIRED" };
  const sessionId = String(formData.get("sessionId") ?? "");
  const questionId = String(formData.get("questionId") ?? "");
  try {
    const saved = await saveUserMistakeReason({ userId: user.id, sessionId, questionId, reasonCode: formData.get("reasonCode") });
    revalidatePath(`/practice/${sessionId}/results`);
    revalidatePath("/mistakes");
    return { status: "success", selected: saved.reasonCode };
  } catch (error) {
    if (error instanceof MistakeReasonError) return { status: "error", code: error.code === "INVALID_REASON" ? "INVALID" : "NOT_ALLOWED" };
    console.error("Could not save mistake reason", { userId: user.id, sessionId, questionId, error });
    return { status: "error", code: "FAILED" };
  }
}
