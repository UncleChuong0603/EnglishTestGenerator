import { LocalMediaStorage } from "./local-storage";
import type { MediaStorage } from "./types";

export type MediaPublishingConfig = {
  localRoot?: string;
  appUrl?: string;
  signingSecret?: string;
};

type StorageFactories = {
  local: (root: string, appUrl: string, signingSecret: string) => MediaStorage;
};

const defaults: StorageFactories = {
  local: (root, appUrl, signingSecret) => new LocalMediaStorage(root, appUrl, signingSecret),
};

export function createConfiguredMediaStorage(config: MediaPublishingConfig, factories: StorageFactories = defaults): MediaStorage {
  if (!config.localRoot || !config.appUrl || !config.signingSecret) throw new Error("LOCAL_MEDIA_CONFIGURATION_REQUIRED");
  return factories.local(config.localRoot, config.appUrl, config.signingSecret);
}

export function mediaPublishingConfigFromEnv(env: Partial<Record<string, string | undefined>> = process.env): MediaPublishingConfig {
  if (env.MEDIA_STORAGE_PROVIDER && env.MEDIA_STORAGE_PROVIDER !== "LOCAL") throw new Error("MEDIA_STORAGE_PROVIDER_MUST_BE_LOCAL");
  return {
    localRoot: env.LOCAL_MEDIA_ROOT,
    appUrl: env.APP_URL,
    signingSecret: env.MEDIA_SIGNING_SECRET,
  };
}
