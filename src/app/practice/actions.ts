"use server";

import { redirect } from "next/navigation";

import { createReadingPracticeSession, validatePracticeConfig } from "@/lib/practice/selector";
import type { PracticeConfig, ReadingPracticeMode, SubmittedAnswer } from "@/lib/practice/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function parseConfig(formData: FormData): PracticeConfig | null {
  const mode = String(formData.get("mode") ?? "") as ReadingPracticeMode;
  const count = Number(formData.get("questionCount"));
  const source = formData.get("source") === "recommended" ? "recommended" : "custom";
  const skill = String(formData.get("skill") ?? "").trim() || undefined;
  const subSkill = String(formData.get("subSkill") ?? "").trim() || undefined;
  const config = { mode, targetQuestionCount: count, source, skill, subSkill } as PracticeConfig;
  return validatePracticeConfig(config) ? config : null;
}

export async function startReadingPractice(formData: FormData) {
  const config = parseConfig(formData);
  if (!config) redirect("/practice?error=invalid_config");
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/sign-in");
  try {
    const sessionId = await createReadingPracticeSession(user.id, config);
    redirect(`/practice/${sessionId}`);
  } catch (error) {
    // redirect() is implemented as a thrown control-flow signal.
    if (typeof error === "object" && error !== null && "digest" in error) throw error;
    console.error("Could not start Reading practice", error);
    const reason = error instanceof Error && error.message === "NO_PUBLISHED_CONTENT"
      ? "not_enough_content"
      : error instanceof Error && error.message === "DATABASE_MIGRATION_REQUIRED"
        ? "database_update_required"
        : error instanceof Error && error.message === "ADMIN_CREDENTIAL_INVALID"
          ? "server_credential_invalid"
        : "start_failed";
    redirect(`/practice?error=${reason}`);
  }
}

type SubmitResult = { ok: true; sessionId: string } | { ok: false; error: "session_expired" | "submit_failed" };

export async function submitReadingPractice(sessionId: string, answers: SubmittedAnswer[]): Promise<SubmitResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { ok: false, error: "session_expired" };
  if (!Array.isArray(answers) || answers.length > 30 || !sessionId) {
    return { ok: false, error: "submit_failed" };
  }
  const safeAnswers = answers.map((answer) => ({
    questionId: String(answer.questionId),
    selectedOptionId: answer.selectedOptionId ? String(answer.selectedOptionId) : null,
    responseTimeMs: Number.isInteger(answer.responseTimeMs) && answer.responseTimeMs! >= 0
      ? Math.min(answer.responseTimeMs!, 86_400_000) : undefined,
  }));
  try {
    const { data, error } = await createAdminClient().rpc("submit_reading_practice_session", {
      p_session_id: sessionId, p_user_id: user.id, p_answers: safeAnswers,
    });
    if (error || !data) throw error ?? new Error("No grading result");
    return { ok: true, sessionId };
  } catch (error) {
    console.error("Could not submit Reading practice", error);
    return { ok: false, error: "submit_failed" };
  }
}

/** Compatibility wrappers for bookmarks and any existing client bundles. */
export async function startPart5Practice(formData: FormData) {
  formData.set("mode", "part_5");
  formData.set("source", "custom");
  return startReadingPractice(formData);
}

export const submitPart5Practice = submitReadingPractice;
