import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import type { ExplanationLanguage, InterfaceLanguage } from "@/lib/i18n/config";

export async function updateLearnerPreferences(userId: string, input: {
  interfaceLanguage: InterfaceLanguage;
  explanationLanguage: ExplanationLanguage;
}) {
  await db.update(profiles).set({
    interfaceLanguage: input.interfaceLanguage,
    explanationLanguage: input.explanationLanguage,
    updatedAt: new Date(),
  }).where(eq(profiles.id, userId));
}
