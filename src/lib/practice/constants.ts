import { part6Taxonomy, part7Taxonomy } from "@/lib/questions/constants";

import type { ReadingPart, ReadingPracticeMode } from "./types";

export const QUESTION_COUNT_OPTIONS = [10, 15, 20] as const;
export const MIXED_PART_WEIGHTS = { 5: 0.4, 6: 0.2, 7: 0.4 } as const;
export const MIN_RECOMMENDATION_ATTEMPTS = 5;
export const MIN_RECOMMENDATION_QUESTIONS_AVAILABLE = 5;

export const READING_TAXONOMY: Record<ReadingPart, Record<string, readonly string[]>> = {
  5: {
    grammar: [
      "verb_tense", "subject_verb_agreement", "passive_voice", "word_form",
      "prepositions", "conjunctions_connectors", "relative_clauses",
      "pronouns_determiners", "gerunds_infinitives", "comparatives", "modifiers",
    ],
    vocabulary: [
      "business_vocabulary", "contextual_vocabulary", "collocations", "phrasal_expressions",
    ],
  },
  6: part6Taxonomy,
  7: part7Taxonomy,
};

const LABEL_OVERRIDES: Record<string, string> = {
  part_5: "Part 5",
  part_6: "Part 6",
  part_7: "Part 7",
  mixed_reading: "Mixed Reading",
  vocabulary_in_context: "Vocabulary in Context",
  cross_text: "Cross-text Understanding",
  sentence_insertion: "Sentence Insertion",
  subject_verb_agreement: "Subject–Verb Agreement",
  conjunctions_connectors: "Conjunctions & Connectors",
  pronouns_determiners: "Pronouns & Determiners",
  gerunds_infinitives: "Gerunds & Infinitives",
  contextual_vocabulary: "Vocabulary in Context",
  phrasal_expressions: "Phrasal Expressions",
  explicit_information: "Explicit Information",
  implied_information: "Implied Information",
  document_purpose: "Document Purpose",
  word_meaning: "Word Meaning",
  reference_words: "Reference Words",
  logical_flow: "Logical Flow",
  document_context: "Document Context",
  sentence_fit: "Sentence Fit",
  logical_position: "Logical Position",
  information_synthesis: "Information Synthesis",
  word_form: "Word Form",
  verb_tense: "Verb Tense",
  passive_voice: "Passive Voice",
  business_vocabulary: "Business Vocabulary",
};

export function friendlyLabel(value: string) {
  return LABEL_OVERRIDES[value] ?? value.split("_").map((word) =>
    word ? word[0].toUpperCase() + word.slice(1) : word,
  ).join(" ");
}

export function modeLabel(mode: ReadingPracticeMode) {
  return friendlyLabel(mode);
}

export function partLabel(part: ReadingPart) {
  return `Part ${part}`;
}
