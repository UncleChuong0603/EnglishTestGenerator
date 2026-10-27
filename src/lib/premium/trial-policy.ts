export const TRIAL_DURATION_DAYS = 30;
export const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

export function trialEndsAt(startedAt: Date) {
  return new Date(startedAt.getTime() + TRIAL_DURATION_MS);
}
