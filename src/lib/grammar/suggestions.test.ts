import { describe, expect, it } from "vitest";
import { getEditorialPost } from "@/lib/blog/editorial";
import { part5SubSkills, part6Taxonomy } from "@/lib/questions/constants";
import { grammarSuggestion } from "./suggestions";

describe("grammar article suggestions", () => {
  it("links every grammar topic present in the question taxonomy to a published article", () => {
    const part5Grammar = part5SubSkills.slice(0, 11);
    for (const subSkill of part5Grammar) {
      const suggestion = grammarSuggestion(5, "grammar", subSkill);
      expect(suggestion, `Part 5 ${subSkill}`).not.toBeNull();
      expect(getEditorialPost(suggestion!.slug)?.status).toBe("PUBLISHED");
    }
    for (const subSkill of part6Taxonomy.grammar) {
      const suggestion = grammarSuggestion(6, "grammar", subSkill);
      expect(suggestion, `Part 6 ${subSkill}`).not.toBeNull();
      expect(getEditorialPost(suggestion!.slug)?.status).toBe("PUBLISHED");
    }
    expect(getEditorialPost(grammarSuggestion(6, "cohesion", "connectors")!.slug)?.status).toBe("PUBLISHED");
    expect(getEditorialPost(grammarSuggestion(7, "reference", "referent")!.slug)?.status).toBe("PUBLISHED");
  });

  it("does not add grammar reading links to vocabulary and listening questions", () => {
    expect(grammarSuggestion(5, "vocabulary", "contextual_vocabulary")).toBeNull();
    expect(grammarSuggestion(6, "cohesion", "logical_flow")).toBeNull();
    expect(grammarSuggestion(2, "question_response", "direct_response")).toBeNull();
  });
});
