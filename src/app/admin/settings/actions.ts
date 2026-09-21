"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/authorization";
import { saveQuestionBankSettings } from "@/lib/admin/question-bank-settings";

export async function saveQuestionBankBlueprintAction(formData: FormData) {
  const actor = await requireAdmin("CONTENT_MANAGE");
  const targetForms = Number(String(formData.get("targetForms") ?? ""));

  try {
    await saveQuestionBankSettings(actor.id, targetForms);
  } catch {
    redirect("/admin/settings?error=INVALID_TARGET_FORMS#question-bank-blueprint");
  }

  revalidatePath("/admin/content");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1#question-bank-blueprint");
}
