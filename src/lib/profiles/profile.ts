import { createClient } from "@/lib/supabase/server";

import type { Profile } from "./types";

type ProfileLookupResult =
  | { profile: Profile; status: "found" }
  | { profile: null; status: "missing" }
  | { profile: null; status: "error" };

/**
 * Reads only the currently authenticated learner's profile.
 * RLS also enforces this ownership rule in the database.
 */
export async function getCurrentProfile(userId: string): Promise<ProfileLookupResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { profile: null, status: "error" };
  }
  console.error("getCurrentProfile error:", error);

  return { profile: null, status: "error" };
}

  if (!data) {
    return { profile: null, status: "missing" };
  }

  return { profile: data as Profile, status: "found" };
}
