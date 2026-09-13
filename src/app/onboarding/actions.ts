"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCookieLanguage } from "@/lib/i18n/get-translations";

function getGoogleAvatarUrl(metadata: Record<string, unknown>): string | null {
  const avatarUrl = metadata.avatar_url ?? metadata.picture;

  if (typeof avatarUrl !== "string") {
    return null;
  }

  try {
    const url = new URL(avatarUrl);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function saveProfile(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (fullName.length < 2 || fullName.length > 100) {
    redirect("/onboarding?error=invalid_name");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/sign-in");
  }

  const avatarUrl = getGoogleAvatarUrl(user.user_metadata);
  const interfaceLanguage = await getCookieLanguage();
  const profile = {
    id: user.id,
    full_name: fullName,
    avatar_url: avatarUrl,
  };
  let { error } = await supabase.from("profiles").upsert(
    { ...profile, interface_language: interfaceLanguage, explanation_language: "both" },
    { onConflict: "id" },
  );

  // Allow onboarding to remain usable while the optional preference migration
  // is pending. Language persistence falls back to the cookie until it is run.
  if (error?.code === "42703" || error?.code === "PGRST204") {
    ({ error } = await supabase.from("profiles").upsert(profile, { onConflict: "id" }));
  }

  if (error) {
    redirect("/onboarding?error=save_failed");
  }

  redirect("/dashboard");
}
