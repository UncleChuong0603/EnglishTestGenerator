import { randomUUID } from "node:crypto";
import type { MediaAccessScope, MediaAssetRecord, MediaKind, MediaAssetRepository, MediaStorage } from "./types";
import { createCanonicalStorageKey, validateMediaUpload } from "./validation";

export async function ingestMedia(dependencies: { storage: MediaStorage; repository: MediaAssetRepository }, input: { kind: MediaKind; accessScope: MediaAccessScope; mimeType: string; body: Uint8Array; ownerUserId?: string | null }) {
  const metadata = await validateMediaUpload(input); const id = randomUUID();
  const storageKey = createCanonicalStorageKey({ ...input, assetId: id });
  const asset: MediaAssetRecord = { id, kind: input.kind, accessScope: input.accessScope, storageProvider: "R2", storageKey, ownerUserId: input.ownerUserId ?? null, status: "UPLOADING", ...metadata };
  await dependencies.repository.createUploading(asset);
  try {
    await dependencies.storage.upload({ key: storageKey, body: input.body, contentType: input.mimeType });
    if (!await dependencies.storage.exists(storageKey)) throw new Error("MEDIA_UPLOAD_NOT_VERIFIED");
    try { await dependencies.repository.markReady(id); } catch (error) { await dependencies.storage.delete(storageKey).catch(() => undefined); await dependencies.repository.markFailed(id).catch(() => undefined); throw error; }
    return { ...asset, status: "READY" as const };
  } catch (error) { await dependencies.repository.markFailed(id).catch(() => undefined); throw error; }
}

export function assertEligibleForActiveContent(asset: Pick<MediaAssetRecord, "status" | "accessScope">) {
  if (asset.status !== "READY" || asset.accessScope !== "CONTENT") throw new Error("MEDIA_NOT_ELIGIBLE_FOR_ACTIVE_CONTENT");
}

export async function createAuthorizedReadUrl(storage: MediaStorage, asset: Pick<MediaAssetRecord, "storageKey" | "status" | "accessScope" | "ownerUserId">, viewer: { userId?: string; isAdmin?: boolean }) {
  if (asset.status !== "READY") throw new Error("MEDIA_NOT_READY");
  if (asset.accessScope === "PRIVATE_USER" && !viewer.isAdmin && viewer.userId !== asset.ownerUserId) throw new Error("MEDIA_FORBIDDEN");
  return storage.createReadUrl(asset.storageKey);
}

export function createPermanentPublicUrl(asset: Pick<MediaAssetRecord, "accessScope">, publicBaseUrl: string) {
  if (asset.accessScope === "PRIVATE_USER") throw new Error("PRIVATE_MEDIA_HAS_NO_PUBLIC_URL");
  throw new Error(`PERMANENT_PUBLIC_URL_DISABLED:${publicBaseUrl ? "configured" : "unconfigured"}`);
}
