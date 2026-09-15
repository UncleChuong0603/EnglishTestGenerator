export type ListeningPlaybackMode = "PRACTICE" | "MOCK_TEST";
export type PlaybackPolicy = { replayAllowed: boolean };

export function playbackPolicyFor(mode: ListeningPlaybackMode): PlaybackPolicy {
  if (mode === "PRACTICE") return { replayAllowed: true };
  throw new Error("MOCK_TEST_PLAYBACK_POLICY_NOT_IMPLEMENTED");
}

