"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { learnerContextSchema } from "@/lib/learner-context/domain";
import { dismissLearnerContextPrompt, saveLearnerContext } from "@/lib/learner-context/service";

export type ContextActionState = { ok: boolean; error?: "invalid" | "unauthenticated" | "save_failed" };

export async function saveContext(_state: ContextActionState, formData: FormData): Promise<ContextActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthenticated" };
  const parsed = learnerContextSchema.safeParse({ studyPurpose: formData.get("studyPurpose"), studyPurposeOther: formData.get("studyPurposeOther"), acquisitionSource: formData.get("acquisitionSource"), acquisitionSourceOther: formData.get("acquisitionSourceOther") });
  if (!parsed.success) return { ok: false, error: "invalid" };
  try {
    await saveLearnerContext(user.id, parsed.data);
    revalidatePath("/settings"); revalidatePath("/dashboard");
    return { ok: true };
  } catch { return { ok: false, error: "save_failed" }; }
}

export async function dismissContextPrompt() {
  const user = await getCurrentUser();
  if (!user) return;
  await dismissLearnerContextPrompt(user.id);
  revalidatePath("/dashboard");
}
