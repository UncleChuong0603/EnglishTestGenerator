import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { DEFAULT_EXPLANATION_LANGUAGE, DEFAULT_INTERFACE_LANGUAGE, isExplanationLanguage, isInterfaceLanguage, LANGUAGE_COOKIE, type ExplanationLanguage, type InterfaceLanguage } from "./config";
export { formatMessage, getTranslations } from "./runtime";

export type LanguagePreferences = { interfaceLanguage: InterfaceLanguage; explanationLanguage: ExplanationLanguage };

export async function getCookieLanguage(): Promise<InterfaceLanguage> {
  const value = (await cookies()).get(LANGUAGE_COOKIE)?.value;
  return isInterfaceLanguage(value) ? value : DEFAULT_INTERFACE_LANGUAGE;
}

export async function getPreferences(userId?: string): Promise<LanguagePreferences> {
  const cookieLanguage = await getCookieLanguage();
  if (!userId) return { interfaceLanguage: cookieLanguage, explanationLanguage: DEFAULT_EXPLANATION_LANGUAGE };
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("interface_language, explanation_language").eq("id", userId).maybeSingle();
  return {
    interfaceLanguage: isInterfaceLanguage(data?.interface_language) ? data.interface_language : cookieLanguage,
    explanationLanguage: isExplanationLanguage(data?.explanation_language) ? data.explanation_language : DEFAULT_EXPLANATION_LANGUAGE,
  };
}
