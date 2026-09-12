"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SubmittedAnswer } from "@/lib/practice/types";

export async function startPart5Practice(formData: FormData) {
  const requestedCount = Number(formData.get("questionCount") ?? 10);
  const questionCount = requestedCount === 20 ? 20 : 10;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/sign-in");

  let data: unknown;
  let error: unknown;
  try {
    const response = await createAdminClient().rpc("create_part5_practice_session", {
      p_user_id: user.id,
      p_question_count: questionCount,
    });
    data = response.data;
    error = response.error;
  } catch (caughtError) {
    error = caughtError;
  }

  if (error || typeof data !== "string") {
    console.error("Could not start Part 5 practice", error);
    redirect("/practice/part-5?error=start_failed");
  }

  redirect(`/practice/part-5/${data}`);
}

type SubmitResult = { ok: true; sessionId: string } | { ok: false; message: string };

export async function submitPart5Practice(
  sessionId: string,
  answers: SubmittedAnswer[],
): Promise<SubmitResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { ok: false, message: "Your session expired. Please sign in again." };

  if (!Array.isArray(answers) || answers.length > 20 || !sessionId) {
    return { ok: false, message: "Your answers could not be submitted. Please refresh and try again." };
  }

  const safeAnswers = answers.map((answer) => ({
    questionId: String(answer.questionId),
    selectedOptionId: answer.selectedOptionId ? String(answer.selectedOptionId) : null,
    responseTimeMs:
      Number.isInteger(answer.responseTimeMs) && answer.responseTimeMs! >= 0
        ? Math.min(answer.responseTimeMs!, 86_400_000)
        : undefined,
  }));

  let data: unknown;
  let error: unknown;
  try {
    const response = await createAdminClient().rpc("submit_part5_practice_session", {
      p_session_id: sessionId,
      p_user_id: user.id,
      p_answers: safeAnswers,
    });
    data = response.data;
    error = response.error;
  } catch (caughtError) {
    error = caughtError;
  }

  if (error || !data) {
    console.error("Could not submit Part 5 practice", error);
    return { ok: false, message: "We could not grade this practice set. Please try again." };
  }

  return { ok: true, sessionId };
}
