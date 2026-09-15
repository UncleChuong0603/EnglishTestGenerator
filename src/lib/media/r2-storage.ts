import "server-only";
import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getR2Env } from "@/lib/env";
import type { MediaObject, MediaStorage } from "./types";

export class R2MediaStorage implements MediaStorage {
  private client?: S3Client;
  private config() { return getR2Env(); }
  private s3() { const config = this.config(); return this.client ??= new S3Client({ region: "auto", endpoint: config.R2_ENDPOINT, credentials: { accessKeyId: config.R2_ACCESS_KEY_ID, secretAccessKey: config.R2_SECRET_ACCESS_KEY } }); }
  async upload(object: MediaObject) { const config = this.config(); await this.s3().send(new PutObjectCommand({ Bucket: config.R2_BUCKET_NAME, Key: object.key, Body: object.body, ContentType: object.contentType, ChecksumAlgorithm: "SHA256" })); }
  async exists(key: string) { const config = this.config(); try { await this.s3().send(new HeadObjectCommand({ Bucket: config.R2_BUCKET_NAME, Key: key })); return true; } catch (error) { if (error && typeof error === "object" && "$metadata" in error && (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return false; throw new Error("R2_EXISTENCE_CHECK_FAILED", { cause: error }); } }
  async createReadUrl(key: string, expiresInSeconds = 900) { const config = this.config(); if (expiresInSeconds < 60 || expiresInSeconds > 3600) throw new Error("INVALID_MEDIA_URL_TTL"); return getSignedUrl(this.s3(), new GetObjectCommand({ Bucket: config.R2_BUCKET_NAME, Key: key }), { expiresIn: expiresInSeconds }); }
  async delete(key: string) { const config = this.config(); await this.s3().send(new DeleteObjectCommand({ Bucket: config.R2_BUCKET_NAME, Key: key })); }
}
