export type GroupAnswerInput = { questionId: string; selectedOptionId: string | null };

/** Rejects missing, extra and foreign children before any review data can be built. */
export function hasExactCompleteGroupAnswers(expectedQuestionIds: readonly string[], answers: readonly GroupAnswerInput[]) {
  if (expectedQuestionIds.length !== 3 || answers.length !== 3 || answers.some((answer) => !answer.selectedOptionId)) return false;
  const expected = [...expectedQuestionIds].sort(); const submitted = answers.map((answer) => answer.questionId).sort();
  return new Set(submitted).size === 3 && expected.every((id, index) => id === submitted[index]);
}

export function canUnlockListeningGroupReview(expectedQuestionIds: readonly string[], persistedQuestionIds: readonly string[]) {
  return expectedQuestionIds.length === 3 && new Set(persistedQuestionIds).size === 3 && expectedQuestionIds.every((id) => persistedQuestionIds.includes(id));
}
