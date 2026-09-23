import "server-only";
import { getServerEnv } from "@/lib/env";
import { LocalMediaStorage } from "./local-storage";
import type { MediaStorage } from "./types";

export function createMediaStorage(): MediaStorage {
  const env = getServerEnv();
  return new LocalMediaStorage(env.LOCAL_MEDIA_ROOT!, env.APP_URL, env.MEDIA_SIGNING_SECRET!);
}
