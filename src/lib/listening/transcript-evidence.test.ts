import { describe, expect, it } from "vitest";
import { buildTranscriptSegments, findAnswerKeywords } from "./transcript-evidence";

describe("Listening transcript evidence", () => {
  it("finds meaningful answer words that occur in the transcript", () => {
    expect(findAnswerKeywords(
      "The product review was moved because the director has a client call at noon.",
      "The director has a client call",
    )).toEqual(["director", "client", "call"]);
  });

  it("ignores filler words and answer words not present in the transcript", () => {
    expect(findAnswerKeywords("Please use the west stairs.", "An elevator is being inspected")).toEqual([]);
  });

  it("marks every matching occurrence without changing transcript text", () => {
    const transcript = "Platform 8 instead of Platform 5.";
    const segments = buildTranscriptSegments(transcript, ["Platform"]);
    expect(segments.map((segment) => segment.text).join("")).toBe(transcript);
    expect(segments.filter((segment) => segment.highlighted).map((segment) => segment.text)).toEqual(["Platform", "Platform"]);
  });
});
