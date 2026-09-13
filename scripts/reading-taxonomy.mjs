export const DIFFICULTIES = ["easy", "medium", "hard"];
export const STATUSES = ["draft", "published", "archived"];
export const OPTION_KEYS = ["A", "B", "C", "D"];

export const READING_TAXONOMY = {
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
  6: {
    grammar: ["word_form", "tense"],
    vocabulary: ["contextual_vocabulary"],
    cohesion: ["connectors", "reference_words", "logical_flow"],
    context: ["document_context"],
    sentence_insertion: ["sentence_fit"],
  },
  7: {
    detail: ["explicit_information"],
    inference: ["implied_information"],
    purpose: ["document_purpose"],
    vocabulary_in_context: ["word_meaning"],
    reference: ["referent"],
    sentence_placement: ["logical_position"],
    cross_text: ["information_synthesis"],
  },
};

export const PASSAGE_SET_TYPES = { 6: ["part6"], 7: ["single", "double", "triple"] };
export const DOCUMENT_TYPES = [
  "email", "memo", "notice", "article", "advertisement", "schedule", "form", "letter",
  "text_message", "web_page", "announcement", "invoice", "receipt", "chart", "table",
];
