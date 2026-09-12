import { describe, expect, it } from "vitest";

import { part5Questions } from "./part5-seed-data.mjs";
import { validatePart5Questions } from "./validate-part5-seed.mjs";

describe("Part 5 development seed", () => {
  it("passes all content and distribution validation", () => {
    const { errors, report } = validatePart5Questions();
    expect(errors).toEqual([]);
    expect(report).toEqual({
      total: 80,
      skill: { grammar: 60, vocabulary: 20 },
      subSkill: {
        verb_tense: 16,
        word_form: 12,
        prepositions: 8,
        conjunctions_connectors: 6,
        relative_clauses: 6,
        pronouns_determiners: 6,
        gerunds_infinitives: 6,
        contextual_vocabulary: 10,
        business_vocabulary: 10,
      },
      difficulty: { easy: 20, medium: 40, hard: 20 },
    });
  });

  it("detects duplicate normalized text and invalid answer references", () => {
    const invalid = structuredClone(part5Questions);
    invalid[1].text = `  ${invalid[0].text.toUpperCase()}  `;
    invalid[1].answer = "Z";
    const messages = validatePart5Questions(invalid).errors.join(" ");
    expect(messages).toContain("duplicate question text");
    expect(messages).toContain("correct answer does not match a valid option");
  });
});

