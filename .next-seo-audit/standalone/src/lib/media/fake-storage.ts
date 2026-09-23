import type { MediaObject, MediaStorage } from "./types";

export class FakeMediaStorage implements MediaStorage {
  readonly objects = new Map<string, MediaObject>();
  failUploads = false;

  async upload(object: MediaObject) {
    if (this.failUploads) throw new Error("MEDIA_STORAGE_UPLOAD_FAILED");
    this.objects.set(object.key, { ...object, body: object.body.slice() });
  }
  async exists(key: string) { return this.objects.has(key); }
  async createReadUrl(key: string, expiresInSeconds = 900) {
    if (!this.objects.has(key)) throw new Error("MEDIA_OBJECT_NOT_FOUND");
    return `https://fake.invalid/${encodeURIComponent(key)}?expires=${expiresInSeconds}`;
  }
  async delete(key: string) { this.objects.delete(key); }
}
