"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
    },
    { onConflict: "id" },
  );

  if (error) {
    redirect("/onboarding?error=save_failed");
  }

  redirect("/dashboard");
}
