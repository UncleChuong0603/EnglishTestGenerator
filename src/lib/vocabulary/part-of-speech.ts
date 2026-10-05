import type { InterfaceLanguage } from "@/lib/i18n/config";

const aliases: Record<string, string> = {
  n: "noun",
  noun: "noun",
  "proper noun": "proper noun",
  v: "verb",
  verb: "verb",
  adj: "adjective",
  adjective: "adjective",
  adv: "adverb",
  adverb: "adverb",
  pron: "pronoun",
  pronoun: "pronoun",
  prep: "preposition",
  preposition: "preposition",
  conj: "conjunction",
  conjunction: "conjunction",
  interj: "interjection",
  interjection: "interjection",
  det: "determiner",
  determiner: "determiner",
  article: "article",
  numeral: "numeral",
  num: "numeral",
  "auxiliary verb": "auxiliary verb",
  "modal verb": "modal verb",
};

const labelsVi: Record<string, string> = {
  noun: "Danh từ",
  "proper noun": "Danh từ riêng",
  verb: "Động từ",
  adjective: "Tính từ",
  adverb: "Trạng từ",
  pronoun: "Đại từ",
  preposition: "Giới từ",
  conjunction: "Liên từ",
  interjection: "Thán từ",
  determiner: "Từ hạn định",
  article: "Mạo từ",
  numeral: "Số từ",
  "auxiliary verb": "Trợ động từ",
  "modal verb": "Động từ khuyết thiếu",
};

export function normalizePartOfSpeech(value: string | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/\.$/, "") ?? "";
  return aliases[normalized] ?? normalized.slice(0, 40);
}

export function partOfSpeechLabel(value: string | undefined, locale: InterfaceLanguage) {
  const normalized = normalizePartOfSpeech(value);
  if (!normalized) return locale === "vi" ? "Chưa xác định" : "Not specified";
  if (locale === "vi") return labelsVi[normalized] ?? normalized;
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
