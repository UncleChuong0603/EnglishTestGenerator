import type { PerformanceStatus, Trend } from "@/lib/analytics/types";
import type { ReadingPart } from "@/lib/practice/types";

import type { InterfaceLanguage } from "./config";
import { getTranslations } from "./runtime";

const taxonomyVi: Record<string, string> = {
  grammar: "Ngữ pháp", vocabulary: "Từ vựng", cohesion: "Liên kết", context: "Ngữ cảnh", sentence_insertion: "Chèn câu",
  detail: "Thông tin chi tiết", inference: "Suy luận", purpose: "Mục đích", vocabulary_in_context: "Từ vựng trong ngữ cảnh", reference: "Tham chiếu", sentence_placement: "Vị trí câu", cross_text: "Liên kết thông tin giữa các văn bản",
  verb_tense: "Thì của động từ", subject_verb_agreement: "Hòa hợp chủ ngữ – động từ", passive_voice: "Câu bị động", word_form: "Từ loại", prepositions: "Giới từ", conjunctions_connectors: "Liên từ và từ nối", relative_clauses: "Mệnh đề quan hệ", pronouns_determiners: "Đại từ và từ hạn định", gerunds_infinitives: "Danh động từ và động từ nguyên mẫu", comparatives: "So sánh", modifiers: "Từ bổ nghĩa", contextual_vocabulary: "Từ vựng theo ngữ cảnh", business_vocabulary: "Từ vựng thương mại", collocations: "Cụm từ kết hợp", phrasal_expressions: "Cụm từ cố định",
  tense: "Thì", connectors: "Từ nối", reference_words: "Từ tham chiếu", logical_flow: "Mạch ý", document_context: "Ngữ cảnh văn bản", sentence_fit: "Mức độ phù hợp của câu", explicit_information: "Thông tin được nêu rõ", implied_information: "Thông tin hàm ý", document_purpose: "Mục đích văn bản", word_meaning: "Nghĩa của từ", referent: "Đối tượng được nhắc đến", logical_position: "Vị trí hợp lý", information_synthesis: "Tổng hợp thông tin",
  email: "Email", memo: "Bản ghi nhớ", notice: "Thông báo", article: "Bài báo", advertisement: "Quảng cáo", schedule: "Lịch trình", form: "Biểu mẫu", letter: "Thư", text_message: "Tin nhắn", web_page: "Trang web", announcement: "Thông báo", invoice: "Hóa đơn", receipt: "Biên lai", chart: "Biểu đồ", table: "Bảng",
};

const taxonomyEn: Record<string, string> = {
  vocabulary_in_context: "Vocabulary in Context", cross_text: "Cross-text Understanding", sentence_insertion: "Sentence Insertion", subject_verb_agreement: "Subject–Verb Agreement", conjunctions_connectors: "Conjunctions & Connectors", pronouns_determiners: "Pronouns & Determiners", gerunds_infinitives: "Gerunds & Infinitives", contextual_vocabulary: "Vocabulary in Context", phrasal_expressions: "Phrasal Expressions", explicit_information: "Explicit Information", implied_information: "Implied Information", document_purpose: "Document Purpose", word_meaning: "Word Meaning", reference_words: "Reference Words", logical_flow: "Logical Flow", document_context: "Document Context", sentence_fit: "Sentence Fit", logical_position: "Logical Position", information_synthesis: "Information Synthesis", word_form: "Word Forms", verb_tense: "Verb Tense", passive_voice: "Passive Voice", business_vocabulary: "Business Vocabulary",
};

export function taxonomyLabel(value: string, locale: InterfaceLanguage) {
  const mapped = locale === "vi" ? taxonomyVi[value] : taxonomyEn[value];
  return mapped ?? value.split("_").map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).join(" ");
}

export function modeLabel(value: string, locale: InterfaceLanguage) {
  const t = getTranslations(locale);
  return t.parts[value as keyof typeof t.parts] ?? taxonomyLabel(value, locale);
}

export function partTitle(part: ReadingPart, locale: InterfaceLanguage) {
  const t = getTranslations(locale);
  return t.parts[`title${part}` as "title5" | "title6" | "title7"];
}

export function statusLabel(value: PerformanceStatus | Trend, locale: InterfaceLanguage) {
  return getTranslations(locale).status[value];
}
