import { describe, expect, it } from "vitest";
import { playbackPolicyFor } from "./playback-policy";

describe("listening playback policy", () => {
  it("allows practice replay and speed controls", () => expect(playbackPolicyFor("PRACTICE")).toEqual({ replayAllowed: true, speedControlsAllowed: true }));
  it("restricts mock replay and speed controls", () => expect(playbackPolicyFor("MOCK_TEST")).toEqual({ replayAllowed: false, speedControlsAllowed: false }));
  it("allows replay only after completion", () => expect(playbackPolicyFor("REVIEW")).toEqual({ replayAllowed: true, speedControlsAllowed: false }));
});
