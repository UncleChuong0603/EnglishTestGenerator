import type { GrammarLesson, GrammarUnit } from "./grammar-learning-path";

export type NumberedGrammarLesson = GrammarLesson & {
  number: number;
  searchTerms: readonly string[];
};

export type SearchableGrammarUnit = Omit<GrammarUnit, "lessons"> & {
  lessons: NumberedGrammarLesson[];
};

const SEARCH_TERMS: Record<string, readonly string[]> = {
  "cau-truc-cau-tieng-anh-co-ban": ["subject verb object", "S V O", "chủ ngữ", "động từ", "tân ngữ"],
  "cum-danh-tu-va-danh-tu-ghep-toeic": ["noun phrase", "compound noun", "danh từ chính"],
  "noi-dong-tu-ngoai-dong-tu-va-bo-ngu": ["transitive", "intransitive", "object", "complement"],
  "loai-tu-trong-toeic-part-5": ["word form", "noun verb adjective adverb", "-tion", "-ment", "-al", "-ly"],
  "danh-tu-dem-duoc-khong-dem-duoc-tieng-anh": ["countable", "uncountable", "many", "much", "few", "little"],
  "mao-tu-a-an-the-va-khong-mao-tu": ["article", "a", "an", "the", "zero article"],
  "dai-tu-va-tu-han-dinh-toeic": ["pronoun", "determiner", "I", "me", "my", "mine", "he", "him", "his", "she", "her", "hers", "they", "them", "their", "theirs", "our", "your"],
  "hoa-hop-chu-ngu-dong-tu-toeic": ["subject verb agreement", "each", "every", "either", "neither", "is", "are"],
  "hien-tai-don-va-hien-tai-tiep-dien": ["present simple", "present continuous", "usually", "every day", "now", "currently"],
  "qua-khu-don-va-qua-khu-tiep-dien": ["past simple", "past continuous", "yesterday", "ago", "while", "when"],
  "hien-tai-hoan-thanh-va-qua-khu-don": ["present perfect", "past simple", "since", "for", "already", "yet", "last"],
  "hien-tai-hoan-thanh-va-hoan-thanh-tiep-dien": ["present perfect continuous", "have been", "has been", "since", "for"],
  "qua-khu-hoan-thanh-va-hoan-thanh-tiep-dien": ["past perfect", "past perfect continuous", "had been", "before", "by the time"],
  "tuong-lai-will-going-to-hien-tai-tiep-dien": ["future", "will", "be going to", "tomorrow", "next week"],
  "thi-va-dang-dong-tu-toeic": ["tense", "verb form", "V1", "V2", "V3", "time marker"],
  "cau-bi-dong-toeic-part-5": ["passive voice", "be V3", "by", "is completed", "was sent"],
  "dong-tu-khuyet-thieu-can-must-should-may": ["modal verb", "can", "could", "must", "should", "may", "might", "have to"],
  "ving-va-to-infinitive-toeic": ["gerund", "infinitive", "V-ing", "to V", "enjoy", "decide"],
  "used-to-be-used-to-get-used-to": ["used to", "be used to", "get used to"],
  "cau-khien-have-get-something-done": ["causative", "have something done", "get something done", "make", "let"],
  "tu-bo-nghia-toeic-part-5": ["modifier", "adjective", "adverb", "very", "highly"],
  "tinh-tu-phan-tu-ing-ed-trong-toeic": ["participial adjective", "-ing", "-ed", "interested", "interesting"],
  "vi-tri-trang-tu-trong-cau-tieng-anh": ["adverb position", "always", "often", "usually", "already", "carefully"],
  "so-sanh-va-luong-tu-toeic": ["comparison", "comparative", "superlative", "more than", "less than", "fewer than", "as as", "most", "least"],
  "gioi-tu-toeic-trong-cong-viec": ["preposition", "in", "on", "at", "by", "until", "during", "since", "for"],
  "lien-tu-va-tu-noi-toeic": ["conjunction", "connector", "because", "because of", "although", "despite", "however", "therefore"],
  "menh-de-muc-dich-va-ket-qua-so-such-enough": ["purpose", "result", "so that", "in order to", "such that", "enough to"],
  "cau-truc-song-song-parallel-structure": ["parallel structure", "both and", "either or", "not only but also"],
  "cau-hoi-va-cau-phu-dinh-tieng-anh": ["question", "negative", "do", "does", "did", "not", "never"],
  "menh-de-quan-he-toeic": ["relative clause", "who", "whom", "which", "that", "whose", "where"],
  "menh-de-danh-tu-va-cau-hoi-gian-tiep": ["noun clause", "indirect question", "what", "whether", "if", "word order"],
  "menh-de-thoi-gian-when-while-before-after": ["time clause", "when", "while", "before", "after", "until", "as soon as"],
  "cau-dieu-kien-tieng-anh-if-wish": ["conditional", "if", "unless", "wish", "would", "if I were"],
  "cau-tuong-thuat-tieng-anh-said-told-asked": ["reported speech", "said", "told", "asked"],
  "menh-de-rut-gon-phan-tu-ving-v3": ["reduced clause", "participle clause", "V-ing", "V3"],
  "dao-ngu-tieng-anh-only-never-not-only": ["inversion", "only", "never", "rarely", "not only"],
  "cau-gia-dinh-recommend-that-be": ["subjunctive", "recommend that", "suggest that", "essential that", "be"],
};

export function grammarSearchTerms(slug: string): readonly string[] {
  return SEARCH_TERMS[slug] ?? [];
}

export function normalizeGrammarSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function filterGrammarUnits(units: readonly SearchableGrammarUnit[], query: string): SearchableGrammarUnit[] {
  const normalizedQuery = normalizeGrammarSearch(query);
  if (!normalizedQuery) return units.map((unit) => ({ ...unit, lessons: [...unit.lessons] }));
  const terms = normalizedQuery.split(/\s+/);

  return units
    .map((unit) => ({
      ...unit,
      lessons: unit.lessons.filter((lesson) => {
        const haystack = normalizeGrammarSearch([lesson.label, lesson.summary, ...lesson.searchTerms].join(" "));
        const words = haystack.split(/\s+/);
        return terms.every((term) => words.some((word) => word.startsWith(term)));
      }),
    }))
    .filter((unit) => unit.lessons.length > 0);
}
