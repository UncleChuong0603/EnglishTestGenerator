import "server-only";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { listeningTranscripts, mediaAssets, questionGroupMedia, stimulusMedia } from "@/db/schema";
import type { MediaAssetRecord, MediaAssetRepository } from "./types";
import type { MediaStorage } from "./types";

export class DrizzleMediaAssetRepository implements MediaAssetRepository {
  async createUploading(asset: MediaAssetRecord) { await db.insert(mediaAssets).values(asset); }
  async markReady(id: string) { await db.update(mediaAssets).set({ status: "READY", updatedAt: new Date() }).where(eq(mediaAssets.id, id)); }
  async markFailed(id: string) { await db.update(mediaAssets).set({ status: "FAILED", updatedAt: new Date() }).where(eq(mediaAssets.id, id)); }
}

export async function archiveMediaAsset(id: string) {
  const updated = await db.update(mediaAssets).set({ status: "ARCHIVED", archivedAt: new Date(), updatedAt: new Date() }).where(and(eq(mediaAssets.id, id), eq(mediaAssets.status, "READY"))).returning({ id: mediaAssets.id });
  if (!updated.length) throw new Error("MEDIA_NOT_READY_FOR_ARCHIVE");
}

export async function hasMediaReferences(id: string) {
  const [groups, stimuli, transcripts] = await Promise.all([
    db.select({ value: count() }).from(questionGroupMedia).where(eq(questionGroupMedia.mediaAssetId, id)),
    db.select({ value: count() }).from(stimulusMedia).where(eq(stimulusMedia.mediaAssetId, id)),
    db.select({ value: count() }).from(listeningTranscripts).where(eq(listeningTranscripts.mediaAssetId, id)),
  ]);
  return groups[0].value + stimuli[0].value + transcripts[0].value > 0;
}

/** Explicit operator/service cleanup only; never called by question editing or archiving. */
export async function physicallyDeleteArchivedMedia(storage: MediaStorage, id: string) {
  const asset = (await db.select({ storageKey: mediaAssets.storageKey, status: mediaAssets.status }).from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1))[0];
  if (!asset || asset.status !== "ARCHIVED") throw new Error("MEDIA_NOT_ARCHIVED");
  if (await hasMediaReferences(id)) throw new Error("MEDIA_STILL_REFERENCED");
  await storage.delete(asset.storageKey);
  await db.delete(mediaAssets).where(and(eq(mediaAssets.id, id), eq(mediaAssets.status, "ARCHIVED")));
}
