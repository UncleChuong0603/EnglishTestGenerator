import { describe, expect, it } from "vitest";

import {
  difficulties,
  part5Skills,
  part5SubSkills,
  part6Taxonomy,
  part7Taxonomy,
  questionStatuses,
  toeicParts,
} from "./constants";

describe("TOEIC question-bank constants", () => {
  it("supports every Listening and Reading part", () => {
    expect(toeicParts).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("uses the intentionally small difficulty and lifecycle models", () => {
    expect(difficulties).toEqual(["easy", "medium", "hard"]);
    expect(questionStatuses).toEqual(["draft", "published", "archived"]);
  });

  it("defines one canonical Part 5 taxonomy", () => {
    expect(part5Skills).toEqual(["grammar", "vocabulary"]);
    expect(part5SubSkills).toEqual([
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
    ]);
  });

  it("defines concise canonical Part 6 and Part 7 taxonomies", () => {
    expect(Object.keys(part6Taxonomy)).toEqual([
      "grammar", "vocabulary", "cohesion", "context", "sentence_insertion",
    ]);
    expect(Object.keys(part7Taxonomy)).toEqual([
      "detail", "inference", "purpose", "vocabulary_in_context", "reference",
      "sentence_placement", "cross_text",
    ]);
  });
});
