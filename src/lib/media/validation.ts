import { createHash, randomUUID } from "node:crypto";
import { imageSize } from "image-size";
import type { MediaAccessScope, MediaKind } from "./types";

export const MEDIA_LIMITS = { AUDIO: 15 * 1024 * 1024, IMAGE: 5 * 1024 * 1024 } as const;
const MIME = { AUDIO: ["audio/mpeg"], IMAGE: ["image/jpeg", "image/png", "image/webp"] } as const;
const EXTENSION: Record<string, string> = { "audio/mpeg": "mp3", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function sniffMime(body: Uint8Array): string | null {
  if (body.length >= 3 && body[0] === 0x49 && body[1] === 0x44 && body[2] === 0x33) return "audio/mpeg";
  if (body.length >= 2 && body[0] === 0xff && body[1] === 0xfb) return "audio/mpeg";
  if (body.length >= 3 && body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff) return "image/jpeg";
  if (body.length >= 8 && Buffer.from(body.subarray(0, 8)).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image/png";
  if (body.length >= 12 && Buffer.from(body.subarray(0, 4)).toString() === "RIFF" && Buffer.from(body.subarray(8, 12)).toString() === "WEBP") return "image/webp";
  return null;
}

function mp3DurationMs(body: Uint8Array): number | null {
  let offset = 0;
  if (body.length >= 10 && body[0] === 0x49 && body[1] === 0x44 && body[2] === 0x33) offset = 10 + ((body[6] & 0x7f) << 21) + ((body[7] & 0x7f) << 14) + ((body[8] & 0x7f) << 7) + (body[9] & 0x7f);
  const bitrates = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320];
  for (let i = offset; i + 4 <= body.length; i++) {
    if (body[i] !== 0xff || (body[i + 1] & 0xe0) !== 0xe0) continue;
    const version = (body[i + 1] >> 3) & 3, layer = (body[i + 1] >> 1) & 3, bitrateIndex = (body[i + 2] >> 4) & 15;
    if (version !== 3 || layer !== 1 || bitrateIndex < 1 || bitrateIndex > 14) continue;
    return Math.round((body.length - i) * 8 / (bitrates[bitrateIndex] * 1000) * 1000);
  }
  return null;
}

export async function validateMediaUpload(input: { kind: MediaKind; accessScope: MediaAccessScope; mimeType: string; body: Uint8Array; ownerUserId?: string | null }) {
  if (!input.body.byteLength) throw new Error("MEDIA_EMPTY");
  if (input.body.byteLength > MEDIA_LIMITS[input.kind]) throw new Error("MEDIA_TOO_LARGE");
  if (!(MIME[input.kind] as readonly string[]).includes(input.mimeType)) throw new Error("MEDIA_TYPE_UNSUPPORTED");
  if (sniffMime(input.body) !== input.mimeType) throw new Error("MEDIA_CONTENT_MISMATCH");
  if (input.accessScope === "PRIVATE_USER" && !input.ownerUserId) throw new Error("MEDIA_OWNER_REQUIRED");
  if (input.accessScope === "CONTENT" && input.ownerUserId) throw new Error("MEDIA_OWNER_NOT_ALLOWED");

  let audioDurationMs: number | null = null, imageWidth: number | null = null, imageHeight: number | null = null;
  if (input.kind === "AUDIO") {
    audioDurationMs = mp3DurationMs(input.body);
  } else {
    try { const dimensions = imageSize(input.body); imageWidth = dimensions.width ?? null; imageHeight = dimensions.height ?? null; } catch { throw new Error("MEDIA_IMAGE_INVALID"); }
  }
  return { mimeType: input.mimeType, byteSize: input.body.byteLength, checksum: createHash("sha256").update(input.body).digest("hex"), audioDurationMs, imageWidth, imageHeight };
}

export function createCanonicalStorageKey(input: { assetId?: string; kind: MediaKind; accessScope: MediaAccessScope; ownerUserId?: string | null; mimeType: string }) {
  const id = input.assetId ?? randomUUID(); const extension = EXTENSION[input.mimeType];
  if (!extension) throw new Error("MEDIA_TYPE_UNSUPPORTED");
  if (input.accessScope === "PRIVATE_USER") {
    if (!input.ownerUserId || !/^[0-9a-f-]{36}$/i.test(input.ownerUserId)) throw new Error("MEDIA_OWNER_REQUIRED");
    return `private/user/${input.ownerUserId}/${id}.${extension}`;
  }
  return `content/listening/${input.kind === "AUDIO" ? "audio" : "images"}/${id}.${extension}`;
}
