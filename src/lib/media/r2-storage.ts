import "server-only";
import { getR2Env } from "@/lib/env";
import { ConfiguredR2MediaStorage } from "./r2-client";
import type { MediaStorage } from "./types";

export class R2MediaStorage implements MediaStorage {
  private delegate?: ConfiguredR2MediaStorage;
  private storage() { const c = getR2Env(); return this.delegate ??= new ConfiguredR2MediaStorage({ endpoint: c.R2_ENDPOINT, accessKeyId: c.R2_ACCESS_KEY_ID, secretAccessKey: c.R2_SECRET_ACCESS_KEY, bucketName: c.R2_BUCKET_NAME }); }
  upload: MediaStorage["upload"] = (object) => this.storage().upload(object);
  exists: MediaStorage["exists"] = (key) => this.storage().exists(key);
  createReadUrl: MediaStorage["createReadUrl"] = (key, ttl) => this.storage().createReadUrl(key, ttl);
  delete: MediaStorage["delete"] = (key) => this.storage().delete(key);
}
