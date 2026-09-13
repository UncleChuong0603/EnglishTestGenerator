export const toeicParts = [1, 2, 3, 4, 5, 6, 7] as const;
export const difficulties = ["easy", "medium", "hard"] as const;
export const questionStatuses = ["draft", "published", "archived"] as const;

export const part5Skills = ["grammar", "vocabulary"] as const;
export const part5SubSkills = [
  "verb_tense",
  "subject_verb_agreement",
  "passive_voice",
  "word_form",
  "prepositions",
  "conjunctions_connectors",
  "relative_clauses",
  "pronouns_determiners",
  "gerunds_infinitives",
  "comparatives",
  "modifiers",
  "contextual_vocabulary",
  "business_vocabulary",
  "collocations",
  "phrasal_expressions",
] as const;

export const part6Taxonomy = {
  grammar: ["word_form", "tense"],
  vocabulary: ["contextual_vocabulary"],
  cohesion: ["connectors", "reference_words", "logical_flow"],
  context: ["document_context"],
  sentence_insertion: ["sentence_fit"],
} as const;

export const part7Taxonomy = {
  detail: ["explicit_information"],
  inference: ["implied_information"],
  purpose: ["document_purpose"],
  vocabulary_in_context: ["word_meaning"],
  reference: ["referent"],
  sentence_placement: ["logical_position"],
  cross_text: ["information_synthesis"],
} as const;

export const passageSetTypes = ["part6", "single", "double", "triple"] as const;
export const readingDocumentTypes = [
  "email", "memo", "notice", "article", "advertisement", "schedule", "form", "letter",
  "text_message", "web_page", "announcement", "invoice", "receipt", "chart", "table",
] as const;

export const passageTypes = [
  "photo",
  "conversation",
  "talk",
  "text_completion",
  "single_passage",
  "double_passage",
  "triple_passage",
] as const;
