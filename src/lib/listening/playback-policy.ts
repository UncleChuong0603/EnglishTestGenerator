export type ListeningPlaybackMode = "PRACTICE" | "MOCK_TEST" | "REVIEW";
export type PlaybackPolicy = { replayAllowed: boolean; speedControlsAllowed: boolean };

export function playbackPolicyFor(mode: ListeningPlaybackMode): PlaybackPolicy {
  if (mode === "MOCK_TEST") return { replayAllowed: false, speedControlsAllowed: false };
  return { replayAllowed: true, speedControlsAllowed: mode === "PRACTICE" };
}

