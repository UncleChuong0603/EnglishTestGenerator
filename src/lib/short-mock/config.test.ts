import { describe, expect, it } from "vitest";
import {
  isShortMockDifficulty,
  shortMockDifficultyFromSource,
  shortMockSource,
} from "./config";

describe("short mock config", () => {
  it.each(["easy", "medium", "hard"] as const)("round-trips %s", (difficulty) => {
    expect(isShortMockDifficulty(difficulty)).toBe(true);
    expect(shortMockDifficultyFromSource(shortMockSource(difficulty))).toBe(difficulty);
  });

  it("rejects unsupported or forged levels", () => {
    expect(isShortMockDifficulty("expert")).toBe(false);
    expect(isShortMockDifficulty(null)).toBe(false);
    expect(shortMockDifficultyFromSource("custom")).toBeNull();
    expect(shortMockDifficultyFromSource("short_mock_expert")).toBeNull();
  });
});
