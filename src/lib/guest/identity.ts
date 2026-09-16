import "server-only";
import { cookies } from "next/headers";
import { createToken, hashToken } from "@/lib/auth/crypto";

export const GUEST_COOKIE = "tg_guest";
export const GUEST_TTL_DAYS = 7;

export async function getGuestOwnerHash() {
  const raw = (await cookies()).get(GUEST_COOKIE)?.value;
  return raw ? hashToken(raw) : null;
}

export async function requireGuestOwnerHash() {
  const store = await cookies();
  let raw = store.get(GUEST_COOKIE)?.value;
  if (!raw) {
    raw = createToken();
    store.set(GUEST_COOKIE, raw, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: GUEST_TTL_DAYS * 86_400 });
  }
  return hashToken(raw);
}

export async function clearGuestIdentity() { (await cookies()).delete(GUEST_COOKIE); }
