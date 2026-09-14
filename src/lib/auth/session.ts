import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { securityEvents, userSessions, users } from "@/db/schema";
import { createToken, hashToken } from "./crypto";

export const SESSION_COOKIE = "etg_session";
export const SESSION_DAYS = 30;

export type CurrentUser = { id: string; email: string; emailNormalized: string; emailVerifiedAt: Date | null; status: string };

export async function createSession(userId: string) {
  const raw = createToken(); const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const cookieStore = await cookies(); const previous = cookieStore.get(SESSION_COOKIE)?.value;
  await db.transaction(async (tx) => {
    if (previous) await tx.update(userSessions).set({ revokedAt: new Date() }).where(and(eq(userSessions.sessionTokenHash, hashToken(previous)), isNull(userSessions.revokedAt)));
    await tx.insert(userSessions).values({ userId, sessionTokenHash: hashToken(raw), expiresAt });
  });
  cookieStore.set(SESSION_COOKIE, raw, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function getCurrentSession() {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [row] = await db.select({ sessionId: userSessions.id, userId: users.id, email: users.email, emailNormalized: users.emailNormalized, emailVerifiedAt: users.emailVerifiedAt, status: users.status })
    .from(userSessions).innerJoin(users, eq(users.id, userSessions.userId))
    .where(and(eq(userSessions.sessionTokenHash, hashToken(raw)), isNull(userSessions.revokedAt), gt(userSessions.expiresAt, new Date()))).limit(1);
  if (!row || row.status !== "active") return null;
  return { sessionId: row.sessionId, user: { id: row.userId, email: row.email, emailNormalized: row.emailNormalized, emailVerifiedAt: row.emailVerifiedAt, status: row.status } satisfies CurrentUser };
}

export async function getCurrentUser() { return (await getCurrentSession())?.user ?? null; }
export async function requireUser() { const user = await getCurrentUser(); if (!user) redirect("/sign-in"); return user; }
export async function requireAnonymous() { if (await getCurrentUser()) redirect("/dashboard"); }
export async function revokeCurrentSession() {
  const current = await getCurrentSession();
  if (current) await db.transaction(async (tx) => { await tx.update(userSessions).set({ revokedAt: new Date() }).where(eq(userSessions.id, current.sessionId)); await tx.insert(securityEvents).values({ userId: current.user.id, eventType: "session_revoked", metadata: { scope: "current" } }); });
  (await cookies()).delete(SESSION_COOKIE);
}
export async function revokeAllUserSessions(userId: string, exceptSessionId?: string) {
  const condition = exceptSessionId ? and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt), sql`${userSessions.id} <> ${exceptSessionId}`) : and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt));
  await db.transaction(async (tx) => { await tx.update(userSessions).set({ revokedAt: new Date() }).where(condition); await tx.insert(securityEvents).values({ userId, eventType: "session_revoked", metadata: { scope: exceptSessionId ? "other" : "all" } }); });
}

import { sql } from "drizzle-orm";
