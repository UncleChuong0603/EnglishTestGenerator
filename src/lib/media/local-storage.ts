import { createHmac, timingSafeEqual } from "node:crypto";
import { lstat, mkdir, open, readFile, realpath, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import type { MediaObject, MediaStorage } from "./types";

export function safeMediaPath(root: string, key: string) {
  let decoded: string;
  try { decoded = decodeURIComponent(key); } catch { throw new Error("MEDIA_KEY_INVALID"); }
  if (!decoded || decoded.includes("\0") || path.isAbsolute(decoded) || decoded.includes("\\") || decoded.split("/").includes("..")) throw new Error("MEDIA_KEY_INVALID");
  const base = path.resolve(root); const target = path.resolve(base, decoded);
  if (target === base || !target.startsWith(base + path.sep)) throw new Error("MEDIA_KEY_INVALID");
  return target;
}

export function signLocalMedia(key: string, expires: number, secret: string) { return createHmac("sha256", secret).update(`${key}\n${expires}`).digest("hex"); }
export function verifyLocalMediaSignature(key: string, expires: number, signature: string, secret: string, now = Date.now()) {
  if (!Number.isSafeInteger(expires) || expires * 1000 <= now || expires * 1000 > now + 3600_000) return false;
  const expected = Buffer.from(signLocalMedia(key, expires, secret), "hex"); let actual: Buffer;
  try { actual = Buffer.from(signature, "hex"); } catch { return false; }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function assertNoSymlinkEscape(root: string, target: string) {
  const realRoot = await realpath(root); const realParent = await realpath(path.dirname(target));
  if (realParent !== realRoot && !realParent.startsWith(realRoot + path.sep)) throw new Error("MEDIA_KEY_INVALID");
  try { if ((await lstat(target)).isSymbolicLink()) throw new Error("MEDIA_KEY_INVALID"); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
}

export class LocalMediaStorage implements MediaStorage {
  constructor(private readonly root: string, private readonly appUrl: string, private readonly secret: string) {}
  async upload(object: MediaObject) {
    const target = safeMediaPath(this.root, object.key); await mkdir(this.root, { recursive: true, mode: 0o755 }); await mkdir(path.dirname(target), { recursive: true, mode: 0o755 }); await assertNoSymlinkEscape(this.root, target);
    const temp = `${target}.${process.pid}.${Date.now()}.tmp`; let handle;
    try { handle = await open(temp, "wx", 0o644); await handle.writeFile(object.body); await handle.sync(); await handle.close(); handle = undefined; await rename(temp, target); }
    catch (error) { await handle?.close().catch(() => undefined); await rm(temp, { force: true }).catch(() => undefined); throw new Error("LOCAL_MEDIA_UPLOAD_FAILED", { cause: error }); }
  }
  async exists(key: string) { try { const target=safeMediaPath(this.root, key); await assertNoSymlinkEscape(this.root,target); const info = await stat(target); return info.isFile() && info.size > 0; } catch { return false; } }
  async read(key: string) { const target=safeMediaPath(this.root,key); await assertNoSymlinkEscape(this.root,target); return new Uint8Array(await readFile(target)); }
  async createReadUrl(key: string, ttl = 900) { if (ttl < 60 || ttl > 3600) throw new Error("INVALID_MEDIA_URL_TTL"); safeMediaPath(this.root, key); const expires = Math.floor(Date.now()/1000) + ttl; const url = new URL("/api/media/local", this.appUrl); url.searchParams.set("key", key); url.searchParams.set("expires", String(expires)); url.searchParams.set("signature", signLocalMedia(key, expires, this.secret)); return url.toString(); }
  async delete(key: string) { const target=safeMediaPath(this.root,key); await assertNoSymlinkEscape(this.root,target); await rm(target, { force: true }); }
}
