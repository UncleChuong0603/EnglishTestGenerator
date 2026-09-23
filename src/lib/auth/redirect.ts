const DEFAULT_RETURN_TO = "/dashboard";

export function safeInternalReturnTo(
  value: string | null | undefined,
  fallback = DEFAULT_RETURN_TO,
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || /[\u0000-\u001f\u007f]|%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return fallback;

  try {
    const base = new URL("https://toeicgym.internal");
    const resolved = new URL(value, base);
    return resolved.origin === base.origin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : fallback;
  } catch {
    return fallback;
  }
}

export function guestContinuationPath(sessionId: string) {
  return `/continue-learning?result=${encodeURIComponent(sessionId)}`;
}

export const GUEST_AUTH_RETURN_COOKIE = "tg_guest_auth_return";

export function safeGuestContinuation(value: string | null | undefined) {
  const path = safeInternalReturnTo(value, "");
  if (!path) return null;
  try {
    const url = new URL(path, "https://toeicgym.internal");
    const result = url.searchParams.get("result");
    return url.pathname === "/continue-learning" && result && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result)
      ? guestContinuationPath(result)
      : null;
  } catch { return null; }
}

/** Only carry known purchase and guest-result destinations through account creation. */
export function safeAuthContinuation(value: string | null | undefined) {
  const guest = safeGuestContinuation(value);
  if (guest) return guest;
  const path = safeInternalReturnTo(value, "");
  if (!path) return null;
  try {
    const url = new URL(path, "https://toeicgym.internal");
    const product = url.searchParams.get("product");
    if (url.pathname !== "/billing/confirm" || url.searchParams.size !== 1 || !product || !/^PREMIUM_(30|90|365)_DAYS$/.test(product)) return null;
    return `/billing/confirm?product=${product}`;
  } catch { return null; }
}
