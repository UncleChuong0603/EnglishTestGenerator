import type { MediaAccessScope, MediaKind, MediaStatus } from "@/lib/media/types";

export type ListeningEligibilityInput = {
  skillArea: string; part: number; responseType: string; questionCount: number;
  options: ReadonlyArray<{ id: string }>; correctOptionId: string | null;
  explanationEn: string | null; explanationVi: string | null; transcript: string | null;
  media: ReadonlyArray<{ kind: MediaKind; role: string; accessScope: MediaAccessScope; status: MediaStatus }>;
};

export type ListeningEligibility = { eligible: true } | { eligible: false; reason: string };

export type ListeningGroupEligibilityInput = {
  skillArea: string; part: number; setType: string; status: string;
  transcript: string | null;
  media: ListeningEligibilityInput["media"];
  questions: ReadonlyArray<Pick<ListeningEligibilityInput, "responseType" | "options" | "correctOptionId" | "explanationEn" | "explanationVi"> & { order: number }>;
};

/** Part 3/4 are validated as one indivisible content unit. */
export function validateListeningGroupEligibility(input: ListeningGroupEligibilityInput): ListeningEligibility {
  if (input.skillArea !== "LISTENING" || ![3, 4].includes(input.part)) return { eligible: false, reason: "INVALID_SKILL_PART" };
  if (input.setType !== (input.part === 3 ? "conversation" : "talk") || input.status !== "published") return { eligible: false, reason: "INVALID_GROUP" };
  if (input.questions.length !== 3) return { eligible: false, reason: "INVALID_QUESTION_COUNT" };
  const orders = input.questions.map((q) => q.order).sort((a, b) => a - b);
  if (orders.some((order, index) => order !== index + 1)) return { eligible: false, reason: "INVALID_QUESTION_ORDER" };
  if (!input.transcript?.trim()) return { eligible: false, reason: "MISSING_TRANSCRIPT" };
  if (input.media.some((asset) => asset.accessScope !== "CONTENT")) return { eligible: false, reason: "INVALID_MEDIA_SCOPE" };
  if (input.media.some((asset) => asset.status !== "READY")) return { eligible: false, reason: "INVALID_MEDIA_STATUS" };
  const audio = input.media.filter((asset) => asset.role === "AUDIO" && asset.kind === "AUDIO");
  const images = input.media.filter((asset) => asset.role === "IMAGE" && asset.kind === "IMAGE");
  if (audio.length !== 1 || images.length > 1 || input.media.some((asset) => (asset.role === "AUDIO" && asset.kind !== "AUDIO") || (asset.role === "IMAGE" && asset.kind !== "IMAGE"))) return { eligible: false, reason: "INVALID_MEDIA" };
  for (const question of input.questions) {
    if (question.responseType !== "MULTIPLE_CHOICE" || question.options.length !== 4) return { eligible: false, reason: "INVALID_OPTION_COUNT" };
    if (!question.correctOptionId || !question.options.some((o) => o.id === question.correctOptionId)) return { eligible: false, reason: "INVALID_CORRECT_OPTION" };
    if (!question.explanationEn?.trim() && !question.explanationVi?.trim()) return { eligible: false, reason: "MISSING_EXPLANATION" };
  }
  return { eligible: true };
}

/** One authoritative validator shared by selection, import tooling and future CMS code. */
export function validateListeningEligibility(input: ListeningEligibilityInput): ListeningEligibility {
  if (input.skillArea !== "LISTENING" || ![1, 2].includes(input.part) || input.responseType !== "MULTIPLE_CHOICE") return { eligible: false, reason: "INVALID_SKILL_PART" };
  if (input.questionCount !== 1) return { eligible: false, reason: "INVALID_QUESTION_COUNT" };
  const expectedOptions = input.part === 1 ? 4 : 3;
  if (input.options.length !== expectedOptions) return { eligible: false, reason: "INVALID_OPTION_COUNT" };
  if (!input.correctOptionId || !input.options.some((option) => option.id === input.correctOptionId)) return { eligible: false, reason: "INVALID_CORRECT_OPTION" };
  if (!input.transcript?.trim()) return { eligible: false, reason: "MISSING_TRANSCRIPT" };
  if (!input.explanationEn?.trim() && !input.explanationVi?.trim()) return { eligible: false, reason: "MISSING_EXPLANATION" };
  if (input.media.some((asset) => asset.accessScope !== "CONTENT")) return { eligible: false, reason: "INVALID_MEDIA_SCOPE" };
  if (input.media.some((asset) => asset.status !== "READY")) return { eligible: false, reason: "INVALID_MEDIA_STATUS" };
  const audio = input.media.filter((asset) => asset.role === "AUDIO" && asset.kind === "AUDIO");
  const image = input.media.filter((asset) => asset.role === "IMAGE" && asset.kind === "IMAGE");
  if (audio.length !== 1 || input.media.some((asset) => asset.role === "AUDIO" && asset.kind !== "AUDIO")) return { eligible: false, reason: "INVALID_AUDIO" };
  if (input.part === 1 && (image.length !== 1 || input.media.some((asset) => asset.role === "IMAGE" && asset.kind !== "IMAGE"))) return { eligible: false, reason: "INVALID_IMAGE" };
  if (input.part === 2 && image.length) return { eligible: false, reason: "UNEXPECTED_IMAGE" };
  return { eligible: true };
}
