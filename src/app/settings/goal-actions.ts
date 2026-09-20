"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { parseGoalProfile } from "@/lib/goals/domain";
import { updateLearnerGoal } from "@/lib/goals/service";

export type GoalActionState = { ok: boolean; error?: "invalid" | "unauthenticated" | "save_failed" };

export async function saveGoal(_state: GoalActionState, formData: FormData): Promise<GoalActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthenticated" };
  const selectedTarget = String(formData.get("targetChoice") ?? "");
  const parsed = parseGoalProfile({
    targetScore: selectedTarget === "custom" ? formData.get("customTarget") : selectedTarget,
    examDate: formData.get("examDate"),
    dailyStudyMinutes: formData.get("dailyStudyMinutes"),
    studyDaysPerWeek: formData.get("studyDaysPerWeek"),
  });
  if (!parsed.success) return { ok: false, error: "invalid" };
  try {
    await updateLearnerGoal(user.id, parsed.data);
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false, error: "save_failed" };
  }
}
