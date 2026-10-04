export function safeNotificationPath(target: unknown) {
  if (target === "workout") return "/workout";
  if (target === "mistakes") return "/mistakes";
  if (target === "vocabulary") return "/vocabulary";
  if (target === "weekly") return "/(tabs)";
  if (typeof target === "string" && /^result:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(target)) return `/result/${target.slice(7)}`;
  if (typeof target === "string" && /^remediation:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(target)) return `/result/${target.slice(12)}`;
  return null;
}

export function audioCacheIsFresh(lastModified: number | null, now: number, maxAgeMs = 24 * 60 * 60_000) {
  return lastModified !== null && lastModified <= now && now - lastModified <= maxAgeMs;
}

export function queuedReviewResolution(errorCode: string) {
  if (errorCode === "CONFLICT") return "DROP" as const;
  if (errorCode === "NETWORK_ERROR" || errorCode === "TIMEOUT") return "RETRY_LATER" as const;
  return "KEEP" as const;
}
