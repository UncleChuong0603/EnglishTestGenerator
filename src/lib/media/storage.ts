import "server-only";
import { getServerEnv } from "@/lib/env";
import { LocalMediaStorage } from "./local-storage";
import { R2MediaStorage } from "./r2-storage";
import type { MediaProvider, MediaStorage } from "./types";

export function getMediaProvider(): MediaProvider { return getServerEnv().MEDIA_STORAGE_PROVIDER; }
export function createMediaStorage(): MediaStorage {
  const env = getServerEnv();
  if (env.MEDIA_STORAGE_PROVIDER === "LOCAL") return new LocalMediaStorage(env.LOCAL_MEDIA_ROOT!, env.APP_URL, env.MEDIA_SIGNING_SECRET!);
  return new R2MediaStorage();
}
