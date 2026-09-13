"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { isExplanationLanguage, isInterfaceLanguage, LANGUAGE_COOKIE } from "@/lib/i18n/config";
export type PreferenceActionState = { ok: boolean; error?: "invalid" | "save_failed" };
export async function savePreferences(_state: PreferenceActionState, formData: FormData): Promise<PreferenceActionState> {
  const interfaceLanguage = formData.get("interfaceLanguage"); const explanationLanguage = formData.get("explanationLanguage");
  if (!isInterfaceLanguage(interfaceLanguage) || !isExplanationLanguage(explanationLanguage)) return { ok: false, error: "invalid" };
  const user = await getCurrentUser(); if (!user) return { ok: false, error: "save_failed" };
  await db.update(profiles).set({ interfaceLanguage, explanationLanguage, updatedAt: new Date() }).where(eq(profiles.id, user.id));
  (await cookies()).set(LANGUAGE_COOKIE, interfaceLanguage, { maxAge: 31_536_000, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" }); revalidatePath("/", "layout"); return { ok: true };
}
export async function setInterfaceLanguage(formData: FormData) {
  const language = formData.get("language"); if (!isInterfaceLanguage(language)) return;
  (await cookies()).set(LANGUAGE_COOKIE, language, { maxAge: 31_536_000, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  const user = await getCurrentUser(); if (user) await db.update(profiles).set({ interfaceLanguage: language, updatedAt: new Date() }).where(eq(profiles.id, user.id)); revalidatePath("/", "layout");
}
