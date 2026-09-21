import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs, questionBankSettings } from "@/db/schema";
import { QUESTION_BANK_TARGET_FORMS } from "./content-coverage";

const SETTINGS_ID = "default";

export async function getQuestionBankSettings() {
  const [settings] = await db
    .select({ targetForms: questionBankSettings.targetForms, updatedAt: questionBankSettings.updatedAt })
    .from(questionBankSettings)
    .where(eq(questionBankSettings.id, SETTINGS_ID))
    .limit(1);

  return settings ?? { targetForms: QUESTION_BANK_TARGET_FORMS, updatedAt: null };
}

export async function saveQuestionBankSettings(actorUserId: string, targetForms: number) {
  if (!Number.isInteger(targetForms) || targetForms < 1 || targetForms > 100) {
    throw new Error("INVALID_TARGET_FORMS");
  }

  await db.transaction(async (tx) => {
    await tx.insert(questionBankSettings).values({ id: SETTINGS_ID, targetForms, updatedBy: actorUserId })
      .onConflictDoUpdate({
        target: questionBankSettings.id,
        set: { targetForms, updatedBy: actorUserId, updatedAt: new Date() },
      });
    await tx.insert(adminAuditLogs).values({
      actorUserId,
      action: "QUESTION_BANK_BLUEPRINT_UPDATED",
      metadata: { targetForms },
    });
  });
}
