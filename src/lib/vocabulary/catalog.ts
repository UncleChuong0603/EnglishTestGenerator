export type VocabularyEntry = { key: string; term: string; meaningVi: string; meaningEn: string; kind: "word" | "phrase" };

// Curated meanings for the sense commonly used in TOEIC workplace contexts.
export const vocabularyCatalog: VocabularyEntry[] = [
  { key: "invoice", term: "invoice", meaningVi: "hóa đơn", meaningEn: "a bill for goods or services", kind: "word" },
  { key: "receipt", term: "receipt", meaningVi: "biên lai", meaningEn: "proof that payment was received", kind: "word" },
  { key: "shipment", term: "shipment", meaningVi: "lô hàng được vận chuyển", meaningEn: "goods sent to a destination", kind: "word" },
  { key: "reservation", term: "reservation", meaningVi: "việc đặt chỗ", meaningEn: "an arrangement to hold a place or service", kind: "word" },
  { key: "deadline", term: "deadline", meaningVi: "hạn chót", meaningEn: "the latest time for completing something", kind: "word" },
  { key: "applicant", term: "applicant", meaningVi: "người ứng tuyển", meaningEn: "a person applying for a job or position", kind: "word" },
  { key: "reimburse", term: "reimburse", meaningVi: "hoàn trả chi phí", meaningEn: "to pay someone back for an expense", kind: "word" },
  { key: "postpone", term: "postpone", meaningVi: "hoãn lại", meaningEn: "to arrange for something to happen later", kind: "word" },
  { key: "confirm", term: "confirm", meaningVi: "xác nhận", meaningEn: "to state that an arrangement is certain", kind: "word" },
  { key: "complimentary", term: "complimentary", meaningVi: "miễn phí (được tặng kèm)", meaningEn: "provided free of charge", kind: "word" },
  { key: "maintenance", term: "maintenance", meaningVi: "việc bảo trì", meaningEn: "work done to keep something operating", kind: "word" },
  { key: "purchase", term: "purchase", meaningVi: "mua hàng; đơn mua hàng", meaningEn: "to buy, or something bought", kind: "word" },
  { key: "schedule", term: "schedule", meaningVi: "lịch trình", meaningEn: "a plan of activities and times", kind: "word" },
  { key: "available", term: "available", meaningVi: "có sẵn; có thể tham gia", meaningEn: "ready for use or free to participate", kind: "word" },
  { key: "refund", term: "refund", meaningVi: "tiền hoàn lại; hoàn tiền", meaningEn: "money returned after a purchase", kind: "word" },
  { key: "submit", term: "submit", meaningVi: "nộp (tài liệu, đơn)", meaningEn: "to send a document for consideration", kind: "word" },
  { key: "renew", term: "renew", meaningVi: "gia hạn", meaningEn: "to extend the period of an agreement", kind: "word" },
  { key: "approve", term: "approve", meaningVi: "phê duyệt", meaningEn: "to officially accept a request or plan", kind: "word" },
  { key: "meet-a-deadline", term: "meet a deadline", meaningVi: "hoàn thành đúng hạn", meaningEn: "to finish work by its due date", kind: "phrase" },
  { key: "place-an-order", term: "place an order", meaningVi: "đặt hàng", meaningEn: "to request goods for purchase", kind: "phrase" },
  { key: "in-advance", term: "in advance", meaningVi: "trước thời hạn; trước khi việc gì xảy ra", meaningEn: "before the expected time", kind: "phrase" },
  { key: "on-behalf-of", term: "on behalf of", meaningVi: "thay mặt cho", meaningEn: "as a representative of someone", kind: "phrase" },
];

export function matchingVocabulary(text: string, limit = 2): VocabularyEntry[] {
  const normalized = text.toLocaleLowerCase("en-US").replace(/[\u2019]/g, "'");
  return vocabularyCatalog.filter((entry) => {
    const forms = entry.kind === "phrase" ? [entry.term] : entry.term.endsWith("e")
      ? [entry.term, `${entry.term}s`, `${entry.term}d`, `${entry.term.slice(0, -1)}ing`]
      : [entry.term, `${entry.term}s`, `${entry.term}ed`, `${entry.term}ing`];
    if (entry.key === "submit") forms.push("submitted", "submitting");
    return forms.some((form) => new RegExp(`(^|[^a-z])${form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+")}(?=$|[^a-z])`, "i").test(normalized));
  }).slice(0, limit);
}

export function vocabularyByKey(key: string) { return vocabularyCatalog.find((entry) => entry.key === key); }

export function vocabularySuggestions(questionText: string, correctAnswer: string, passages: readonly string[] = [], limit = 2) {
  const primary = matchingVocabulary(`${questionText.replace(/_{2,}/g, correctAnswer)} ${correctAnswer}`, limit);
  if (primary.length >= limit) return primary;
  const found = new Set(primary.map((entry) => entry.key));
  return [...primary, ...matchingVocabulary(passages.join(" "), vocabularyCatalog.length).filter((entry) => !found.has(entry.key)).slice(0, limit - primary.length)];
}
