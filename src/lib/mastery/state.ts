import { MASTERY_REQUIRED_SUCCESS_STREAK } from "./constants";

export type MasteryState = { status: "UNRESOLVED" | "MASTERED"; reviewAttemptCount: number; reviewSuccessStreak: number };
export function applyMasteryEvidence(state: MasteryState, source: "normal" | "review", correct: boolean): MasteryState {
  if (source === "normal") return correct ? state : { ...state, status: "UNRESOLVED", reviewSuccessStreak: 0 };
  const streak = correct ? state.reviewSuccessStreak + 1 : 0;
  return { status: streak >= MASTERY_REQUIRED_SUCCESS_STREAK ? "MASTERED" : "UNRESOLVED", reviewAttemptCount: state.reviewAttemptCount + 1, reviewSuccessStreak: streak };
}
