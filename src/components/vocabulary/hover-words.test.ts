import { describe, expect, it } from "vitest";
import { positionVocabularyPopover } from "./hover-words";

describe("positionVocabularyPopover", () => {
  it("keeps the popover below the word when there is useful space", () => {
    const position = positionVocabularyPopover(
      { left: 830, top: 340, bottom: 370 },
      { width: 1920, height: 760 },
    );

    expect(position).toEqual({
      x: 830,
      placement: "below",
      offset: 378,
      maxHeight: 374,
    });
  });

  it("anchors the popover fully above a word near the viewport bottom", () => {
    const position = positionVocabularyPopover(
      { left: 140, top: 650, bottom: 680 },
      { width: 768, height: 720 },
    );

    expect(position).toEqual({
      x: 140,
      placement: "above",
      offset: 78,
      maxHeight: 400,
    });
  });

  it("keeps the popover inside a narrow viewport", () => {
    const position = positionVocabularyPopover(
      { left: 350, top: 240, bottom: 270 },
      { width: 375, height: 500 },
    );

    expect(position).toEqual({
      x: 47,
      placement: "above",
      offset: 268,
      maxHeight: 224,
    });
  });
});
