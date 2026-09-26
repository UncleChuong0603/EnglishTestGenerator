export type GrammarSuggestion = { slug: string; title: string };

const bySubSkill: Record<string, GrammarSuggestion> = {
  word_form: { slug: "loai-tu-trong-toeic-part-5", title: "Loại từ trong TOEIC Part 5" },
  verb_tense: { slug: "thi-va-dang-dong-tu-toeic", title: "Thì và dạng động từ TOEIC" },
  tense: { slug: "thi-va-dang-dong-tu-toeic", title: "Thì và dạng động từ TOEIC" },
  subject_verb_agreement: { slug: "hoa-hop-chu-ngu-dong-tu-toeic", title: "Hòa hợp chủ ngữ – động từ TOEIC" },
  passive_voice: { slug: "cau-bi-dong-toeic-part-5", title: "Câu bị động TOEIC Part 5" },
  prepositions: { slug: "gioi-tu-toeic-trong-cong-viec", title: "Giới từ TOEIC trong công việc" },
  conjunctions_connectors: { slug: "lien-tu-va-tu-noi-toeic", title: "Liên từ và từ nối TOEIC" },
  connectors: { slug: "lien-tu-va-tu-noi-toeic", title: "Liên từ và từ nối TOEIC" },
  relative_clauses: { slug: "menh-de-quan-he-toeic", title: "Mệnh đề quan hệ TOEIC" },
  pronouns_determiners: { slug: "dai-tu-va-tu-han-dinh-toeic", title: "Đại từ và từ hạn định TOEIC" },
  referent: { slug: "dai-tu-va-tu-han-dinh-toeic", title: "Đại từ và từ hạn định TOEIC" },
  gerunds_infinitives: { slug: "ving-va-to-infinitive-toeic", title: "V-ing và to-infinitive TOEIC" },
  comparatives: { slug: "so-sanh-va-luong-tu-toeic", title: "So sánh và lượng từ TOEIC" },
  modifiers: { slug: "tu-bo-nghia-toeic-part-5", title: "Từ bổ nghĩa trong TOEIC Part 5" },
};

/** Taxonomy is checked together with part so unrelated reading or listening items stay unlinked. */
export function grammarSuggestion(part: number, skill: string, subSkill: string): GrammarSuggestion | null {
  if ((part === 5 || part === 6) && skill === "grammar") return bySubSkill[subSkill] ?? null;
  if (part === 6 && skill === "cohesion" && subSkill === "connectors") return bySubSkill.connectors;
  if (part === 7 && skill === "reference" && subSkill === "referent") return bySubSkill.referent;
  return null;
}
