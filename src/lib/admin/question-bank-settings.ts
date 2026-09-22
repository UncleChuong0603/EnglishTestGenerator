import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs, questionBankSettings } from "@/db/schema";
import { QUESTION_BANK_TARGET_FORMS } from "./content-coverage";

const SETTINGS_ID = "default";
export const DEFAULT_SIMILARITY_THRESHOLD_PERCENT = 58;
export const DEFAULT_SUPPORT_RESPONSE_TARGET_HOURS = 24;

export async function getQuestionBankSettings() {
  const [settings] = await db
    .select({
      targetForms: questionBankSettings.targetForms,
      similarityThresholdPercent: questionBankSettings.similarityThresholdPercent,
      supportResponseTargetHours: questionBankSettings.supportResponseTargetHours,
      updatedAt: questionBankSettings.updatedAt,
    })
    .from(questionBankSettings)
    .where(eq(questionBankSettings.id, SETTINGS_ID))
    .limit(1);

  return settings ?? {
    targetForms: QUESTION_BANK_TARGET_FORMS,
    similarityThresholdPercent: DEFAULT_SIMILARITY_THRESHOLD_PERCENT,
    supportResponseTargetHours: DEFAULT_SUPPORT_RESPONSE_TARGET_HOURS,
    updatedAt: null,
  };
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

export async function saveContentQualitySettings(actorUserId: string, similarityThresholdPercent: number) {
  if (!Number.isInteger(similarityThresholdPercent) || similarityThresholdPercent < 25 || similarityThresholdPercent > 95) {
    throw new Error("INVALID_SIMILARITY_THRESHOLD");
  }

  await db.transaction(async (tx) => {
    await tx.insert(questionBankSettings).values({ id: SETTINGS_ID, similarityThresholdPercent, updatedBy: actorUserId })
      .onConflictDoUpdate({
        target: questionBankSettings.id,
        set: { similarityThresholdPercent, updatedBy: actorUserId, updatedAt: new Date() },
      });
    await tx.insert(adminAuditLogs).values({
      actorUserId,
      action: "CONTENT_QUALITY_SETTINGS_UPDATED",
      metadata: { similarityThresholdPercent },
    });
  });
}

export async function saveSupportSettings(actorUserId: string, supportResponseTargetHours: number) {
  if (!Number.isInteger(supportResponseTargetHours) || supportResponseTargetHours < 1 || supportResponseTargetHours > 168) {
    throw new Error("INVALID_SUPPORT_RESPONSE_TARGET");
  }

  await db.transaction(async (tx) => {
    await tx.insert(questionBankSettings).values({ id: SETTINGS_ID, supportResponseTargetHours, updatedBy: actorUserId })
      .onConflictDoUpdate({
        target: questionBankSettings.id,
        set: { supportResponseTargetHours, updatedBy: actorUserId, updatedAt: new Date() },
      });
    await tx.insert(adminAuditLogs).values({
      actorUserId,
      action: "SUPPORT_SETTINGS_UPDATED",
      metadata: { supportResponseTargetHours },
    });
  });
}
