"use server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";

export async function saveProfile(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim(); if (fullName.length < 2 || fullName.length > 100) redirect("/onboarding?error=invalid_name");
  const user = await requireUser(); const interfaceLanguage = await getCookieLanguage();
  await db.insert(profiles).values({ id: user.id, fullName, interfaceLanguage, explanationLanguage: "both" }).onConflictDoUpdate({ target: profiles.id, set: { fullName, interfaceLanguage, updatedAt: new Date() } });
  redirect("/dashboard");
}
