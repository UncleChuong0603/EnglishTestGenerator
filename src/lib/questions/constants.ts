export const toeicParts = [1, 2, 3, 4, 5, 6, 7] as const;
export const difficulties = ["easy", "medium", "hard"] as const;
export const questionStatuses = ["draft", "published", "archived"] as const;

export const part5Skills = ["grammar", "vocabulary"] as const;
export const part5SubSkills = [
  "verb_tense",
  "word_form",
  "prepositions",
  "conjunctions_connectors",
  "relative_clauses",
  "pronouns_determiners",
  "gerunds_infinitives",
  "contextual_vocabulary",
  "business_vocabulary",
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
