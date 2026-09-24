import { vocabularyStudyTopics } from "./study-list";

export type VocabularyEntry = { key: string; term: string; meaningVi: string; meaningEn: string; kind: "word" | "phrase" };

// Curated meanings for the sense commonly used in TOEIC workplace contexts.
export const vocabularyCatalog: VocabularyEntry[] = vocabularyStudyTopics.flatMap((topic) => topic.entries);

const vocabularyPatterns = vocabularyCatalog.map((entry) => {
  const forms = entry.kind === "phrase" ? [entry.term] : entry.term.endsWith("e")
    ? [entry.term, `${entry.term}s`, `${entry.term}d`, `${entry.term.slice(0, -1)}ing`]
    : [entry.term, `${entry.term}s`, `${entry.term}ed`, `${entry.term}ing`];
  if (entry.key === "submit") forms.push("submitted", "submitting");
  return new RegExp(`(^|[^a-z])(?:${forms.map((form) => form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+")).join("|")})(?=$|[^a-z])`, "i");
});

export function matchingVocabulary(text: string, limit = 2): VocabularyEntry[] {
  const normalized = text.toLocaleLowerCase("en-US").replace(/[\u2019]/g, "'");
  return vocabularyCatalog.filter((_, index) => vocabularyPatterns[index].test(normalized)).slice(0, limit);
}

export function vocabularyByKey(key: string) { return vocabularyCatalog.find((entry) => entry.key === key); }

export function vocabularySuggestions(questionText: string, correctAnswer: string, passages: readonly string[] = [], limit = 2) {
  const answerMatches = matchingVocabulary(correctAnswer, vocabularyCatalog.length);
  const questionMatches = matchingVocabulary(questionText.replace(/_{2,}/g, correctAnswer), vocabularyCatalog.length);
  const passageMatches = matchingVocabulary(passages.join(" "), vocabularyCatalog.length);
  const candidates = new Map<string, { entry: VocabularyEntry; score: number }>();
  for (const [entries, sourceScore] of [[answerMatches, 2], [questionMatches, 1], [passageMatches, 1]] as const) {
    for (const entry of entries) {
      const score = sourceScore + (vocabularyCatalog.indexOf(entry) < 100 ? 2 : 0) + (entry.kind === "phrase" ? 1 : 0);
      if (!candidates.has(entry.key) || candidates.get(entry.key)!.score < score) candidates.set(entry.key, { entry, score });
    }
  }
  return [...candidates.values()].sort((a, b) => b.score - a.score).slice(0, limit).map(({ entry }) => entry);
}
