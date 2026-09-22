"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/authorization";
import {
  saveContentQualitySettings,
  saveQuestionBankSettings,
  saveSupportSettings,
} from "@/lib/admin/question-bank-settings";

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

export async function saveContentQualitySettingsAction(formData: FormData) {
  const actor = await requireAdmin("CONTENT_MANAGE");
  const similarityThresholdPercent = Number(String(formData.get("similarityThresholdPercent") ?? ""));

  try {
    await saveContentQualitySettings(actor.id, similarityThresholdPercent);
  } catch {
    redirect("/admin/settings?error=INVALID_SIMILARITY_THRESHOLD#content-quality");
  }

  revalidatePath("/admin/content/similarity");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=content-quality#content-quality");
}

export async function saveSupportSettingsAction(formData: FormData) {
  const actor = await requireAdmin("CONTENT_MANAGE");
  const supportResponseTargetHours = Number(String(formData.get("supportResponseTargetHours") ?? ""));

  try {
    await saveSupportSettings(actor.id, supportResponseTargetHours);
  } catch {
    redirect("/admin/settings?error=INVALID_SUPPORT_RESPONSE_TARGET#support-operations");
  }

  revalidatePath("/admin/support");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=support#support-operations");
}
