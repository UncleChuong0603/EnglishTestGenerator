import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { MediaObject, MediaStorage } from "./types";

export type R2StorageConfig = { endpoint: string; accessKeyId: string; secretAccessKey: string; bucketName: string };

/** Shared R2 implementation for the runtime and trusted content-authoring CLI. */
export class ConfiguredR2MediaStorage implements MediaStorage {
  private readonly client: S3Client;
  constructor(private readonly config: R2StorageConfig) {
    this.client = new S3Client({ region: "auto", endpoint: config.endpoint, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } });
  }
  async upload(object: MediaObject) { await this.client.send(new PutObjectCommand({ Bucket: this.config.bucketName, Key: object.key, Body: object.body, ContentType: object.contentType, ChecksumAlgorithm: "SHA256" })); }
  async exists(key: string) { try { await this.client.send(new HeadObjectCommand({ Bucket: this.config.bucketName, Key: key })); return true; } catch (error) { if (error && typeof error === "object" && "$metadata" in error && (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return false; throw new Error("R2_EXISTENCE_CHECK_FAILED", { cause: error }); } }
  async createReadUrl(key: string, expiresInSeconds = 900) { if (expiresInSeconds < 60 || expiresInSeconds > 3600) throw new Error("INVALID_MEDIA_URL_TTL"); return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.config.bucketName, Key: key }), { expiresIn: expiresInSeconds }); }
  async delete(key: string) { await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucketName, Key: key })); }
}
