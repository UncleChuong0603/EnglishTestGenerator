import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import type { Profile } from "./types";

type ProfileLookupResult = { profile: Profile; status: "found" } | { profile: null; status: "missing" | "error" };
export async function getCurrentProfile(userId: string): Promise<ProfileLookupResult> {
  try {
    const [row] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    if (!row || !row.fullName) return { profile: null, status: "missing" };
    return { profile: { id: row.id, full_name: row.fullName, avatar_url: row.avatarUrl, created_at: row.createdAt.toISOString(), updated_at: row.updatedAt.toISOString() }, status: "found" };
  } catch { return { profile: null, status: "error" }; }
}
