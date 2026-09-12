import { describe, expect, it } from "vitest";

import {
  difficulties,
  part5Skills,
  part5SubSkills,
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
      "word_form",
      "prepositions",
      "conjunctions_connectors",
      "relative_clauses",
      "pronouns_determiners",
      "gerunds_infinitives",
      "contextual_vocabulary",
      "business_vocabulary",
    ]);
  });
});
