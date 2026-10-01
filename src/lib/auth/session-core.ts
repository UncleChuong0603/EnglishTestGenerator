import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { userSessions, users } from "@/db/schema";
import { createToken, hashToken } from "./crypto";

export const SESSION_COOKIE = "etg_session";
export const SESSION_DAYS = 30;
export type CurrentUser = { id: string; email: string; emailNormalized: string; emailVerifiedAt: Date | null; status: string };

/** Issuance is transport-neutral; raw tokens are returned once, stored only hashed. */
export async function issueSessionToken(userId: string, previousRawToken?: string) {
  const token = createToken(), expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.transaction(async (tx) => {
    const [account] = await tx.select({ id: users.id }).from(users)
      .where(and(eq(users.id, userId), eq(users.status, "active"), isNull(users.deletedAt))).for("update").limit(1);
    if (!account) throw new Error("ACCOUNT_UNAVAILABLE");
    if (previousRawToken) await tx.update(userSessions).set({ revokedAt: new Date() }).where(and(eq(userSessions.sessionTokenHash, hashToken(previousRawToken)), isNull(userSessions.revokedAt)));
    await tx.insert(userSessions).values({ userId, sessionTokenHash: hashToken(token), expiresAt });
  });
  return { token, expiresAt };
}

/** No dependency on cookies, Authorization headers or Next navigation. */
export async function getSessionByToken(raw: string | null | undefined) {
  if (!raw || raw.length > 256) return null;
  const [row] = await db.select({ sessionId: userSessions.id, userId: users.id, email: users.email, emailNormalized: users.emailNormalized, emailVerifiedAt: users.emailVerifiedAt, status: users.status })
    .from(userSessions).innerJoin(users, eq(users.id, userSessions.userId))
    .where(and(eq(userSessions.sessionTokenHash, hashToken(raw)), isNull(userSessions.revokedAt), gt(userSessions.expiresAt, new Date()), isNull(users.deletedAt))).limit(1);
  if (!row || row.status !== "active") return null;
  return { sessionId: row.sessionId, user: { id: row.userId, email: row.email, emailNormalized: row.emailNormalized, emailVerifiedAt: row.emailVerifiedAt, status: row.status } satisfies CurrentUser };
}
