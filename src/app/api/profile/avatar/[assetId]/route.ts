import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { mediaAssets, profiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { createMediaStorage } from "@/lib/media/storage";
import { avatarAssetId, canViewAvatar, isAvatarAssetId } from "@/lib/profile-avatar";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await context.params;
  if (!isAvatarAssetId(assetId)) return notFound();
  const [avatar] = await db.select({
    ownerUserId: mediaAssets.ownerUserId,
    storageKey: mediaAssets.storageKey,
    currentAvatarUrl: profiles.avatarUrl,
    visibility: profiles.rankingVisibility,
  }).from(mediaAssets).innerJoin(profiles, eq(profiles.id, mediaAssets.ownerUserId)).where(and(
    eq(mediaAssets.id, assetId),
    eq(mediaAssets.kind, "IMAGE"),
    eq(mediaAssets.accessScope, "PRIVATE_USER"),
    eq(mediaAssets.status, "READY"),
  )).limit(1);

  if (!avatar?.ownerUserId || avatarAssetId(avatar.currentAvatarUrl) !== assetId) return notFound();
  const viewer = await getCurrentUser();
  if (!canViewAvatar(avatar.ownerUserId, avatar.visibility, viewer?.id)) return notFound();

  try {
    const url = await createMediaStorage().createReadUrl(avatar.storageKey, 60);
    return NextResponse.redirect(url, { status: 307, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return notFound();
  }
}

function notFound() {
  return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "private, no-store" } });
}
