import { LocalMediaStorage } from "./local-storage";
import { ConfiguredR2MediaStorage, type R2StorageConfig } from "./r2-client";
import type { MediaProvider, MediaStorage } from "./types";

export type MediaPublishingConfig = {
  provider: MediaProvider;
  localRoot?: string;
  appUrl?: string;
  signingSecret?: string;
  r2?: Partial<R2StorageConfig>;
};

type StorageFactories = {
  local: (root: string, appUrl: string, signingSecret: string) => MediaStorage;
  r2: (config: R2StorageConfig) => MediaStorage;
};

const defaults: StorageFactories = {
  local: (root, appUrl, signingSecret) => new LocalMediaStorage(root, appUrl, signingSecret),
  r2: (config) => new ConfiguredR2MediaStorage(config),
};

export function createConfiguredMediaStorage(config: MediaPublishingConfig, factories: StorageFactories = defaults): MediaStorage {
  if (config.provider === "LOCAL") {
    if (!config.localRoot || !config.appUrl || !config.signingSecret) throw new Error("LOCAL_MEDIA_CONFIGURATION_REQUIRED");
    return factories.local(config.localRoot, config.appUrl, config.signingSecret);
  }
  const { endpoint, accessKeyId, secretAccessKey, bucketName } = config.r2 ?? {};
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) throw new Error("R2_MEDIA_CONFIGURATION_REQUIRED");
  return factories.r2({ endpoint, accessKeyId, secretAccessKey, bucketName });
}

export function mediaPublishingConfigFromEnv(env: Partial<Record<string, string | undefined>> = process.env): MediaPublishingConfig {
  const raw = env.MEDIA_STORAGE_PROVIDER;
  if (raw !== "LOCAL" && raw !== "R2") throw new Error("MEDIA_STORAGE_PROVIDER_MUST_BE_EXPLICIT");
  return {
    provider: raw,
    localRoot: env.LOCAL_MEDIA_ROOT,
    appUrl: env.APP_URL,
    signingSecret: env.MEDIA_SIGNING_SECRET,
    r2: { endpoint: env.R2_ENDPOINT, accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY, bucketName: env.R2_BUCKET_NAME },
  };
}
