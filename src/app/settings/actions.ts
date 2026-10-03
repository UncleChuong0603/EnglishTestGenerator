"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/db";
import { mediaAssets, profiles } from "@/db/schema";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";
import { getCurrentSession, revokeAllUserSessions } from "@/lib/auth/session";
import { isExplanationLanguage, isInterfaceLanguage, LANGUAGE_COOKIE } from "@/lib/i18n/config";
import { getServerEnv } from "@/lib/env";
import { ingestMedia } from "@/lib/media/ingestion";
import { DrizzleMediaAssetRepository, archiveMediaAsset, physicallyDeleteArchivedMedia } from "@/lib/media/repository";
import { createMediaStorage } from "@/lib/media/storage";
import { MEDIA_LIMITS } from "@/lib/media/validation";
import { avatarAssetId, buildAvatarUrl } from "@/lib/profile-avatar";
export type PreferenceActionState = { ok: boolean; error?: "invalid" | "save_failed" };
type AvatarError = "invalid" | "too_large" | "unsupported" | "corrupt" | "rate" | "unauthorized" | "save_failed";
export type AvatarActionState = { status: "idle" | "removed" } | { status: "saved"; avatarUrl: string } | { status: "error"; error: AvatarError };

async function removeStoredAvatar(assetId: string | null, userId: string) {
  if (!assetId) return;
  const [owned] = await db.select({ id: mediaAssets.id }).from(mediaAssets).where(and(eq(mediaAssets.id, assetId), eq(mediaAssets.ownerUserId, userId), eq(mediaAssets.accessScope, "PRIVATE_USER"))).limit(1);
  if (!owned) return;
  const storage = createMediaStorage();
  await archiveMediaAsset(assetId);
  await physicallyDeleteArchivedMedia(storage, assetId);
}

export async function saveAvatar(_state: AvatarActionState, formData: FormData): Promise<AvatarActionState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", error: "unauthorized" };
  try { await enforceRateLimit("avatar_update", user.id); }
  catch (error) { return { status: "error", error: error instanceof Error && error.message === "RATE_LIMITED" ? "rate" : "save_failed" }; }

  const [profile] = await db.select({ avatarUrl: profiles.avatarUrl }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
  const previousAssetId = avatarAssetId(profile?.avatarUrl);
  if (formData.get("intent") === "remove") {
    await db.update(profiles).set({ avatarUrl: null, updatedAt: new Date() }).where(eq(profiles.id, user.id));
    await removeStoredAvatar(previousAssetId, user.id).catch(error => console.error("[avatar] old file cleanup failed", error));
    revalidatePath("/", "layout");
    return { status: "removed" };
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { status: "error", error: "invalid" };
  if (file.size > MEDIA_LIMITS.IMAGE) return { status: "error", error: "too_large" };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return { status: "error", error: "unsupported" };

  const storage = createMediaStorage();
  let asset: Awaited<ReturnType<typeof ingestMedia>>;
  try {
    asset = await ingestMedia({ storage, repository: new DrizzleMediaAssetRepository() }, { kind: "IMAGE", accessScope: "PRIVATE_USER", mimeType: file.type, body: new Uint8Array(await file.arrayBuffer()), ownerUserId: user.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { status: "error", error: message === "MEDIA_TOO_LARGE" ? "too_large" : message === "MEDIA_TYPE_UNSUPPORTED" ? "unsupported" : ["MEDIA_CONTENT_MISMATCH", "MEDIA_IMAGE_INVALID"].includes(message) ? "corrupt" : "save_failed" };
  }

  const avatarUrl = buildAvatarUrl(getServerEnv().APP_URL, asset.id);
  try {
    await db.update(profiles).set({ avatarUrl, updatedAt: new Date() }).where(eq(profiles.id, user.id));
  } catch (error) {
    await removeStoredAvatar(asset.id, user.id).catch(cleanupError => console.error("[avatar] rollback cleanup failed", cleanupError));
    console.error("[avatar] profile update failed", error);
    return { status: "error", error: "save_failed" };
  }
  await removeStoredAvatar(previousAssetId, user.id).catch(error => console.error("[avatar] old file cleanup failed", error));
  revalidatePath("/", "layout");
  return { status: "saved", avatarUrl };
}
export type LearningEmailActionState = { ok: boolean; enabled?: boolean; error?: "invalid" | "save_failed" };
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
export async function saveRankingVisibility(formData: FormData) { const visibility=String(formData.get("visibility")??""); if(!["PUBLIC","ANONYMOUS","HIDDEN"].includes(visibility)) return; const user=await getCurrentUser();if(!user)return;await db.update(profiles).set({rankingVisibility:visibility,updatedAt:new Date()}).where(eq(profiles.id,user.id));revalidatePath("/settings");revalidatePath("/ranking"); }
export async function saveLearningEmailPreference(_state: LearningEmailActionState, formData: FormData): Promise<LearningEmailActionState> {
  const value = formData.get("learningEmailEnabled");
  if (value !== "true" && value !== "false") return { ok: false, error: "invalid" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "save_failed" };
  const enabled = value === "true";
  try {
    await db.update(profiles).set({ learningEmailEnabled: enabled, updatedAt: new Date() }).where(eq(profiles.id, user.id));
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { ok: true, enabled };
  } catch {
    return { ok: false, error: "save_failed" };
  }
}
export async function saveDisplayName(formData: FormData) {
  const name = formData.get("displayName");
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) return;
  const user = await getCurrentUser(); if (!user) return;
  await db.update(profiles).set({ fullName: name.trim(), updatedAt: new Date() }).where(eq(profiles.id, user.id));
  revalidatePath("/settings"); revalidatePath("/ranking");
}
export async function signOutOtherSessions() {
  const current = await getCurrentSession(); if (!current) return;
  await revokeAllUserSessions(current.user.id, current.sessionId);
  revalidatePath("/settings");
}
