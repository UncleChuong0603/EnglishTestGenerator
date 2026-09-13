"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { isExplanationLanguage, isInterfaceLanguage, LANGUAGE_COOKIE } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";

export type PreferenceActionState = { ok: boolean; error?: "invalid" | "save_failed" };

export async function savePreferences(_state: PreferenceActionState, formData: FormData): Promise<PreferenceActionState> {
  const interfaceLanguage = formData.get("interfaceLanguage");
  const explanationLanguage = formData.get("explanationLanguage");
  if (!isInterfaceLanguage(interfaceLanguage) || !isExplanationLanguage(explanationLanguage)) return { ok: false, error: "invalid" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "save_failed" };
  const { error } = await supabase.from("profiles").update({ interface_language: interfaceLanguage, explanation_language: explanationLanguage }).eq("id", user.id);
  if (error) return { ok: false, error: "save_failed" };
  (await cookies()).set(LANGUAGE_COOKIE, interfaceLanguage, { maxAge: 31_536_000, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setInterfaceLanguage(formData: FormData) {
  const language = formData.get("language");
  if (!isInterfaceLanguage(language)) return;
  (await cookies()).set(LANGUAGE_COOKIE, language, { maxAge: 31_536_000, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await supabase.from("profiles").update({ interface_language: language }).eq("id", user.id);
  revalidatePath("/", "layout");
}
