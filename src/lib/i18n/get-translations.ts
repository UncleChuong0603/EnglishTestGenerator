import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { DEFAULT_EXPLANATION_LANGUAGE, DEFAULT_INTERFACE_LANGUAGE, isExplanationLanguage, isInterfaceLanguage, LANGUAGE_COOKIE, type ExplanationLanguage, type InterfaceLanguage } from "./config";
export { formatMessage, getTranslations } from "./runtime";
export type LanguagePreferences = { interfaceLanguage: InterfaceLanguage; explanationLanguage: ExplanationLanguage };
export async function getCookieLanguage(): Promise<InterfaceLanguage> { const value = (await cookies()).get(LANGUAGE_COOKIE)?.value; return isInterfaceLanguage(value) ? value : DEFAULT_INTERFACE_LANGUAGE; }
export async function getPreferences(userId?: string): Promise<LanguagePreferences> {
  const cookieLanguage = await getCookieLanguage(); if (!userId) return { interfaceLanguage: cookieLanguage, explanationLanguage: DEFAULT_EXPLANATION_LANGUAGE };
  const [row] = await db.select({ interfaceLanguage: profiles.interfaceLanguage, explanationLanguage: profiles.explanationLanguage }).from(profiles).where(eq(profiles.id, userId)).limit(1);
  return { interfaceLanguage: isInterfaceLanguage(row?.interfaceLanguage) ? row.interfaceLanguage : cookieLanguage, explanationLanguage: isExplanationLanguage(row?.explanationLanguage) ? row.explanationLanguage : DEFAULT_EXPLANATION_LANGUAGE };
}
