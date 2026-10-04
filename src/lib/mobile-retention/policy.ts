export type RetentionKind = "TODAYS_WORKOUT" | "VOCAB_DUE" | "UNRESOLVED_REVIEW" | "WEEKLY_REVIEW";

export function selectRetentionKind(input: {
  preferences: { todaysWorkout: boolean; vocabularyDue: boolean; unresolvedReview: boolean; weeklyReview: boolean };
  vietnamWeekday: number;
  dueVocabulary: number;
  unresolvedMistakes: number;
  completedQuestionsToday: number;
}): RetentionKind | null {
  if (input.preferences.weeklyReview && input.vietnamWeekday === 0) return "WEEKLY_REVIEW";
  if (input.preferences.vocabularyDue && input.dueVocabulary > 0) return "VOCAB_DUE";
  if (input.preferences.unresolvedReview && input.unresolvedMistakes > 0) return "UNRESOLVED_REVIEW";
  if (input.preferences.todaysWorkout && input.completedQuestionsToday === 0) return "TODAYS_WORKOUT";
  return null;
}

export function shouldRemovePushDevice(errorCode: string | undefined) {
  return errorCode === "DeviceNotRegistered";
}
