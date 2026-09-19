export const MEDIA_KINDS = ["AUDIO", "IMAGE"] as const;
export const MEDIA_ACCESS_SCOPES = ["CONTENT", "PRIVATE_USER"] as const;
export const MEDIA_STATUSES = ["UPLOADING", "READY", "FAILED", "ARCHIVED"] as const;

export type MediaKind = (typeof MEDIA_KINDS)[number];
export type MediaAccessScope = (typeof MEDIA_ACCESS_SCOPES)[number];
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export type MediaProvider = "R2" | "LOCAL";
export type MediaObject = { key: string; body: Uint8Array; contentType: string };
export type MediaStorage = {
  upload(object: MediaObject): Promise<void>;
  exists(key: string): Promise<boolean>;
  createReadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
};

export type MediaAssetRecord = {
  id: string; kind: MediaKind; accessScope: MediaAccessScope; storageProvider: MediaProvider;
  storageKey: string; mimeType: string; byteSize: number; checksum: string;
  status: MediaStatus; ownerUserId: string | null; audioDurationMs: number | null;
  imageWidth: number | null; imageHeight: number | null;
};

export type MediaAssetRepository = {
  createUploading(asset: MediaAssetRecord): Promise<void>;
  markReady(id: string): Promise<void>;
  markFailed(id: string): Promise<void>;
};
