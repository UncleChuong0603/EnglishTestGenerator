export const TRIAL_DURATION_MS = 72 * 60 * 60 * 1000;
export const TRIAL_MIN_LEARNING_DAYS = 2;
export const TRIAL_MIN_ANSWERED_QUESTIONS = 20;

export function trialEndsAt(startedAt: Date) {
  return new Date(startedAt.getTime() + TRIAL_DURATION_MS);
}

export function hasMeaningfulLearning(days: number, answers: number) {
  return days >= TRIAL_MIN_LEARNING_DAYS && answers >= TRIAL_MIN_ANSWERED_QUESTIONS;
}
