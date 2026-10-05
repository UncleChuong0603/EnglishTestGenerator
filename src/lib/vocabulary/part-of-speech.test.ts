import { describe, expect, it } from "vitest";
import { normalizePartOfSpeech, partOfSpeechLabel } from "./part-of-speech";

describe("vocabulary part of speech", () => {
  it("normalizes abbreviations returned by dictionary providers", () => {
    expect(normalizePartOfSpeech("n")).toBe("noun");
    expect(normalizePartOfSpeech("adj.")).toBe("adjective");
    expect(normalizePartOfSpeech("verb")).toBe("verb");
  });

  it("localizes common word classes and keeps an honest empty fallback", () => {
    expect(partOfSpeechLabel("noun", "vi")).toBe("Danh từ");
    expect(partOfSpeechLabel("prep", "vi")).toBe("Giới từ");
    expect(partOfSpeechLabel("adverb", "en")).toBe("Adverb");
    expect(partOfSpeechLabel("", "vi")).toBe("Chưa xác định");
    expect(partOfSpeechLabel(undefined, "en")).toBe("Not specified");
  });
});
