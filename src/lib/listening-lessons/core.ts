import { createHash } from "node:crypto";

export function normalizeTranscript(value: string) {
  return value.normalize("NFKC").replace(/[^\p{L}\p{N}\s]/gu, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

export function transcriptFingerprint(value: string) {
  return createHash("sha256").update(normalizeTranscript(value)).digest("hex");
}

export function validateLesson(input: { title: string; description: string; transcript: string; toeicPart: number; imageAlt: string; hasImage: boolean }) {
  if (!input.title.trim() || input.title.length > 160) return "TITLE_INVALID";
  if (input.description.length > 500) return "DESCRIPTION_TOO_LONG";
  if (!Number.isInteger(input.toeicPart) || input.toeicPart < 1 || input.toeicPart > 4) return "PART_INVALID";
  if (normalizeTranscript(input.transcript).length < 20 || input.transcript.length > 20_000) return "TRANSCRIPT_INVALID";
  if (input.hasImage && (!input.imageAlt.trim() || input.imageAlt.length > 240)) return "IMAGE_ALT_REQUIRED";
  if (input.toeicPart === 1 && !input.hasImage) return "PART_1_IMAGE_REQUIRED";
  return null;
}
