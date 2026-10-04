import { Directory, File, Paths } from "expo-file-system";
import { audioCacheIsFresh } from "@/lib/retention-policy";

const CACHE_MAX_AGE_MS = 24 * 60 * 60_000;
const directory = new Directory(Paths.cache, "toeicgym-listening-v1");

function ensureDirectory() {
  if (!directory.exists) directory.create({ idempotent: true, intermediates: true });
}

export function purgeExpiredAudioCache(now = Date.now()) {
  ensureDirectory();
  for (const entry of directory.list()) {
    if (entry instanceof File && !audioCacheIsFresh(entry.lastModified, now, CACHE_MAX_AGE_MS)) entry.delete();
  }
}

export async function cachedAudioUri(mediaId: string, remoteUrl: string, token: string, now = Date.now()) {
  ensureDirectory();
  purgeExpiredAudioCache(now);
  const target = new File(directory, `${mediaId}.audio`);
  if (target.exists && audioCacheIsFresh(target.lastModified, now, CACHE_MAX_AGE_MS)) return target.uri;
  try {
    const downloaded = await File.downloadFileAsync(remoteUrl, target, { headers: { Authorization: `Bearer ${token}` }, idempotent: true });
    return downloaded.uri;
  } catch {
    if (target.exists) target.delete();
    return null;
  }
}

export function clearAudioCache() {
  if (directory.exists) directory.delete();
}
