import "server-only";
import { and, eq, isNull, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { securityEvents, userSessions } from "@/db/schema";
import { getSessionByToken, issueSessionToken, SESSION_COOKIE } from "./session-core";
export { getSessionByToken, issueSessionToken, SESSION_COOKIE, SESSION_DAYS, type CurrentUser } from "./session-core";

export async function createSession(userId: string) {
  const cookieStore = await cookies(); const previous = cookieStore.get(SESSION_COOKIE)?.value;
  const { token, expiresAt } = await issueSessionToken(userId, previous);
  const raw = token;
  cookieStore.set(SESSION_COOKIE, raw, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function getCurrentSession() {
  return getSessionByToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser() { return (await getCurrentSession())?.user ?? null; }
export async function requireUser() { const user = await getCurrentUser(); if (!user) redirect("/sign-in"); return user; }
export async function requireAnonymous() { if (await getCurrentUser()) redirect("/progress"); }
export async function revokeCurrentSession() {
  const current = await getCurrentSession();
  if (current) await db.transaction(async (tx) => { await tx.update(userSessions).set({ revokedAt: new Date() }).where(eq(userSessions.id, current.sessionId)); await tx.insert(securityEvents).values({ userId: current.user.id, eventType: "session_revoked", metadata: { scope: "current" } }); });
  (await cookies()).delete(SESSION_COOKIE);
}
export async function revokeAllUserSessions(userId: string, exceptSessionId?: string) {
  const condition = exceptSessionId ? and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt), ne(userSessions.id, exceptSessionId)) : and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt));
  await db.transaction(async (tx) => { await tx.update(userSessions).set({ revokedAt: new Date() }).where(condition); await tx.insert(securityEvents).values({ userId, eventType: "session_revoked", metadata: { scope: exceptSessionId ? "other" : "all" } }); });
}
