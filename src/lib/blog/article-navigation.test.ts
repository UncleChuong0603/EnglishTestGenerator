import { describe, expect, it } from "vitest";
import { POST_CATEGORIES } from "./core";
import { articleHub, articleNextStep } from "./article-navigation";

describe("article navigation by search intent", () => {
  it("gives every article category an indexable topic hub and a useful next action", () => {
    for (const category of POST_CATEGORIES) {
      const hub = articleHub(category, "vi");
      const action = articleNextStep(category, "vi", false);
      expect(hub.href).toMatch(/^\/(?!sign-in|practice(?:\/|$))/);
      expect(hub.label.length).toBeGreaterThan(8);
      expect(action.href).toMatch(/^\//);
      expect(action.label.length).toBeGreaterThan(8);
    }
  });

  it("routes readers to the closest practice surface", () => {
    expect(articleNextStep("GRAMMAR", "vi", false).href).toBe("/toeic/part-5/practice");
    expect(articleNextStep("LISTENING", "vi", false).href).toBe("/toeic/listening");
    expect(articleNextStep("VOCABULARY", "vi", false).href).toBe("/toeic/flashcards-tu-vung-cong-so");
    expect(articleNextStep("EXAM_REVIEW", "vi", false).href).toBe("/thi-thu-toeic-online");
    expect(articleNextStep("STUDY_PLAN", "vi", true).href).toBe("/dashboard");
  });
});

