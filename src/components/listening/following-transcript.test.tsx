import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FollowingTranscript, currentSentenceIndex, splitTranscriptSentences } from "./following-transcript";

describe("transcript following audio", () => {
  it("keeps option letters and speaker turns with the spoken sentence", () => {
    expect(splitTranscriptSentences("A. The door is open. B. It is closed.")).toEqual([
      "A. The door is open.", "B. It is closed.",
    ]);
    expect(splitTranscriptSentences("Woman: Is it open? Man: Yes, it is.")).toEqual([
      "Woman: Is it open?", "Man: Yes, it is.",
    ]);
  });

  it("moves the highlight as playback advances or seeks while keeping the next sentence visible", () => {
    const transcript = "Listen now. Then speak along.";
    const sentences = splitTranscriptSentences(transcript);
    expect(currentSentenceIndex(sentences, 0, 10)).toBe(0);
    expect(currentSentenceIndex(sentences, 8, 10)).toBe(1);
    expect(currentSentenceIndex(sentences, 1, 10)).toBe(0);
    const html = renderToStaticMarkup(<FollowingTranscript duration={10} locale="vi" time={8} transcript={transcript} />);
    expect(html).toContain("Listen now.");
    expect(html).toMatch(/<mark[^>]*>Then speak along\.<\/mark>/);
  });
});
