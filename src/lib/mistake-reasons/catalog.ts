import { z } from "zod";

export const MISTAKE_REASON_CODES = [
  "VOCAB_UNKNOWN",
  "GRAMMAR_RULE",
  "PARAPHRASE_MISSED",
  "DISTRACTOR_TRAP",
  "MISHEARD_WORD",
  "LOST_CONTEXT",
  "INFERENCE_ERROR",
  "TIME_PRESSURE",
  "CARELESS",
  "OTHER",
  "UNKNOWN",
] as const;

export const MISTAKE_REASON_EVIDENCE = [
  "USER_SELECTED",
  "SYSTEM_INFERRED",
  "SYSTEM_SUGGESTED",
] as const;

export const mistakeReasonCodeSchema = z.enum(MISTAKE_REASON_CODES);
export const mistakeReasonEvidenceSchema = z.enum(MISTAKE_REASON_EVIDENCE);
export type MistakeReasonCode = z.infer<typeof mistakeReasonCodeSchema>;
export type MistakeReasonEvidence = z.infer<typeof mistakeReasonEvidenceSchema>;

type ReasonDefinition = {
  code: MistakeReasonCode;
  label: { vi: string; en: string };
  parts: readonly number[];
  selfReportPreferred?: boolean;
};

const ALL_PARTS = [1, 2, 3, 4, 5, 6, 7] as const;

export const MISTAKE_REASON_CATALOG: readonly ReasonDefinition[] = [
  { code: "VOCAB_UNKNOWN", label: { vi: "Chưa biết từ/cụm từ", en: "Unknown word or phrase" }, parts: ALL_PARTS },
  { code: "GRAMMAR_RULE", label: { vi: "Chưa nắm quy tắc ngữ pháp", en: "Grammar rule" }, parts: [2, 3, 4, 5, 6, 7] },
  { code: "PARAPHRASE_MISSED", label: { vi: "Không nhận ra cách diễn đạt tương đương", en: "Missed paraphrase" }, parts: [2, 3, 4, 6, 7] },
  { code: "DISTRACTOR_TRAP", label: { vi: "Bị phương án nhiễu đánh lừa", en: "Distractor trap" }, parts: ALL_PARTS },
  { code: "MISHEARD_WORD", label: { vi: "Nghe nhầm hoặc bỏ lỡ từ", en: "Misheard word" }, parts: [1, 2, 3, 4] },
  { code: "LOST_CONTEXT", label: { vi: "Mất mạch ngữ cảnh", en: "Lost context" }, parts: [3, 4, 6, 7] },
  { code: "INFERENCE_ERROR", label: { vi: "Suy luận chưa đúng", en: "Inference error" }, parts: [3, 4, 7] },
  { code: "TIME_PRESSURE", label: { vi: "Thiếu thời gian", en: "Time pressure" }, parts: ALL_PARTS, selfReportPreferred: true },
  { code: "CARELESS", label: { vi: "Bất cẩn", en: "Careless" }, parts: ALL_PARTS, selfReportPreferred: true },
  { code: "OTHER", label: { vi: "Lý do khác", en: "Other" }, parts: ALL_PARTS, selfReportPreferred: true },
  { code: "UNKNOWN", label: { vi: "Chưa đủ dữ liệu", en: "Not enough evidence" }, parts: ALL_PARTS },
] as const;

export function mistakeReasonDefinition(code: MistakeReasonCode) {
  return MISTAKE_REASON_CATALOG.find((item) => item.code === code)!;
}
export function isReasonApplicable(code: MistakeReasonCode, part: number) {
  return mistakeReasonDefinition(code).parts.includes(part);
}

export function applicableMistakeReasons(part: number) {
  return MISTAKE_REASON_CATALOG.filter((item) => item.code !== "UNKNOWN" && item.parts.includes(part));
}

/** Suggestions are prompts, not diagnoses. CARELESS is never system-suggested. */
export function suggestMistakeReasons(input: { part: number; skill?: string; subSkill?: string }) {
  const taxonomy = `${input.skill ?? ""} ${input.subSkill ?? ""}`.toLowerCase();
  const preferred: MistakeReasonCode[] = [];
  if (/grammar|tense|clause|word form|preposition|agreement|part of speech/.test(taxonomy)) preferred.push("GRAMMAR_RULE");
  if (/vocab|meaning|word|collocation/.test(taxonomy)) preferred.push("VOCAB_UNKNOWN");
  if (/paraphrase|synonym/.test(taxonomy)) preferred.push("PARAPHRASE_MISSED");
  if (/infer|purpose|imply|intention/.test(taxonomy)) preferred.push("INFERENCE_ERROR");
  if (input.part <= 4) preferred.push("MISHEARD_WORD");
  if ([3, 4, 6, 7].includes(input.part)) preferred.push("LOST_CONTEXT");
  preferred.push("DISTRACTOR_TRAP", "VOCAB_UNKNOWN");
  return [...new Set(preferred)].filter((code) => isReasonApplicable(code, input.part)).slice(0, 4);
}

/** No behavioral signal currently meets the threshold for a reliable diagnosis. */
export function inferMistakeReason(): { code: "UNKNOWN"; evidenceSource: "SYSTEM_INFERRED" } {
  return { code: "UNKNOWN", evidenceSource: "SYSTEM_INFERRED" };
}

