import { describe, expect, it } from "vitest";

import { difficulties, questionStatuses, toeicParts } from "./constants";

describe("TOEIC question-bank constants", () => {
  it("supports every Listening and Reading part", () => {
    expect(toeicParts).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("uses the intentionally small difficulty and lifecycle models", () => {
    expect(difficulties).toEqual(["easy", "medium", "hard"]);
    expect(questionStatuses).toEqual(["draft", "published", "archived"]);
  });
});
