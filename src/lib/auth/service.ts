import "server-only";
import { and, eq, gt, isNotNull, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { accountActivationTokens, authIdentities, emailVerificationTokens, passwordResetTokens, profiles, securityEvents, userSessions, users } from "@/db/schema";
import { getServerEnv } from "@/lib/env";
import { sendAuthEmail } from "@/lib/email/mailer";
import { createToken, hashPassword, hashToken, normalizeEmail, verifyPassword } from "./crypto";

const VERIFICATION_HOURS = 24;
const RESET_MINUTES = 60;

type RegistrationOutcome = "created" | "verification_resent" | "ignored";

async function sendVerificationEmail(user: { email: string }, rawToken: string) {
  await sendAuthEmail({ to: user.email, subject: "Verify your English Test account", text: `Verify your account: ${getServerEnv().APP_URL}/verify-email?token=${encodeURIComponent(rawToken)}` });
}

async function issueVerificationEmail(user: { id: string; email: string }) {
  const rawToken = createToken();
  await db.transaction(async (tx) => {
    await tx.update(emailVerificationTokens).set({ usedAt: new Date() }).where(and(eq(emailVerificationTokens.userId, user.id), isNull(emailVerificationTokens.usedAt)));
    await tx.insert(emailVerificationTokens).values({ userId: user.id, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + VERIFICATION_HOURS * 3_600_000) });
  });
  await sendVerificationEmail(user, rawToken);
}

async function logEvent(userId: string | null, eventType: string, metadata: Record<string, unknown> = {}) {
  await db.insert(securityEvents).values({ userId, eventType, metadata });
}

export async function registerPasswordUser(emailInput: string, password: string): Promise<RegistrationOutcome> {
  const email = emailInput.trim(); const emailNormalized = normalizeEmail(email); const passwordHash = await hashPassword(password); const rawToken = createToken();
  const createdUser = await db.transaction(async (tx) => {
    const [created] = await tx.insert(users).values({ email, emailNormalized, passwordHash }).onConflictDoNothing({ target: users.emailNormalized }).returning({ id: users.id, email: users.email });
    if (!created) return null;
    await tx.insert(profiles).values({ id: created.id });
    await tx.insert(emailVerificationTokens).values({ userId: created.id, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + VERIFICATION_HOURS * 3_600_000) });
    await tx.insert(securityEvents).values({ userId: created.id, eventType: "account_created", metadata: { method: "password" } });
    return created;
  });
  if (createdUser) {
    await sendVerificationEmail(createdUser, rawToken);
    return "created";
  }
  const [pendingPasswordUser] = await db.select({ id: users.id, email: users.email }).from(users).where(and(eq(users.emailNormalized, emailNormalized), eq(users.status, "pending_verification"), isNull(users.emailVerifiedAt), isNotNull(users.passwordHash))).limit(1);
  if (!pendingPasswordUser) return "ignored";
  await issueVerificationEmail(pendingPasswordUser);
  return "verification_resent";
}

export async function verifyEmailToken(rawToken: string) {
  const result = await db.transaction(async (tx) => {
    const [token] = await tx.select().from(emailVerificationTokens).where(and(eq(emailVerificationTokens.tokenHash, hashToken(rawToken)), isNull(emailVerificationTokens.usedAt), gt(emailVerificationTokens.expiresAt, new Date()))).for("update").limit(1);
    if (!token) return null;
    const [account] = await tx.select({ status: users.status }).from(users).where(eq(users.id, token.userId)).limit(1);
    if (!account || account.status !== "pending_verification") return null;
    const now = new Date();
    await tx.update(emailVerificationTokens).set({ usedAt: now }).where(and(eq(emailVerificationTokens.id, token.id), isNull(emailVerificationTokens.usedAt)));
    await tx.update(users).set({ emailVerifiedAt: now, status: "active", updatedAt: now }).where(eq(users.id, token.userId));
    await tx.insert(securityEvents).values({ userId: token.userId, eventType: "email_verified", metadata: {} });
    return token.userId;
  });
  return result;
}

export async function resendVerification(emailInput: string) {
  const [user] = await db.select().from(users).where(eq(users.emailNormalized, normalizeEmail(emailInput))).limit(1);
  if (!user || user.emailVerifiedAt || user.status === "disabled") return;
  await issueVerificationEmail(user);
}

export async function authenticatePassword(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.emailNormalized, normalizeEmail(email))).limit(1);
  if (!user?.passwordHash) { await hashPassword(password); return null; }
  if (!(await verifyPassword(user.passwordHash, password)) || user.status !== "active" || !user.emailVerifiedAt) return null;
  await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
  await logEvent(user.id, "login_success", { method: "password" });
  return user;
}

export async function requestPasswordReset(emailInput: string) {
  const [user] = await db.select().from(users).where(eq(users.emailNormalized, normalizeEmail(emailInput))).limit(1);
  if (!user?.passwordHash || user.status !== "active" || !user.emailVerifiedAt) return;
  const rawToken = createToken();
  await db.transaction(async (tx) => {
    await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)));
    await tx.insert(passwordResetTokens).values({ userId: user.id, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + RESET_MINUTES * 60_000) });
  });
  await sendAuthEmail({ to: user.email, subject: "Reset your English Test password", text: `Reset your password: ${getServerEnv().APP_URL}/reset-password?token=${encodeURIComponent(rawToken)}` });
}

export async function resetPassword(rawToken: string, password: string) {
  return db.transaction(async (tx) => {
    const [token] = await tx.select().from(passwordResetTokens).where(and(eq(passwordResetTokens.tokenHash, hashToken(rawToken)), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date()))).for("update").limit(1);
    if (!token) return false;
    const now = new Date();
    const [account] = await tx.select({ status: users.status }).from(users).where(eq(users.id, token.userId)).limit(1);
    if (!account || account.status !== "active") return false;
    await tx.update(users).set({ passwordHash: await hashPassword(password), updatedAt: now }).where(and(eq(users.id, token.userId), eq(users.status, "active")));
    await tx.update(passwordResetTokens).set({ usedAt: now }).where(and(eq(passwordResetTokens.userId, token.userId), isNull(passwordResetTokens.usedAt)));
    await tx.update(userSessions).set({ revokedAt: now }).where(and(eq(userSessions.userId, token.userId), isNull(userSessions.revokedAt)));
    await tx.insert(securityEvents).values({ userId: token.userId, eventType: "password_reset", metadata: {} });
    return true;
  });
}

export async function changePassword(userId: string, currentPassword: string | null, newPassword: string, keepSessionId?: string) {
  const newPasswordHash = await hashPassword(newPassword);
  return db.transaction(async (tx) => {
    const [user] = await tx.select().from(users).where(eq(users.id, userId)).for("update").limit(1);
    if (!user || user.status !== "active") return "invalid" as const;
    if (user.passwordHash && (!currentPassword || !(await verifyPassword(user.passwordHash, currentPassword)))) return "wrong_password" as const;
    await tx.update(users).set({ passwordHash: newPasswordHash, updatedAt: new Date() }).where(eq(users.id, userId));
    const revokeWhere = keepSessionId ? and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt), ne(userSessions.id, keepSessionId)) : and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt));
    await tx.update(userSessions).set({ revokedAt: new Date() }).where(revokeWhere);
    await tx.insert(securityEvents).values({ userId, eventType: user.passwordHash ? "password_changed" : "password_set", metadata: {} });
    return "ok" as const;
  });
}

export async function getUserAuthMethods(userId: string) {
  const [[user], identities] = await Promise.all([db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1), db.select({ provider: authIdentities.provider }).from(authIdentities).where(eq(authIdentities.userId, userId))]);
  return { password: Boolean(user?.passwordHash), google: identities.some((identity) => identity.provider === "google") };
}

export async function consumeActivationToken(rawToken: string, password: string) {
  return db.transaction(async (tx) => {
    const [token] = await tx.select().from(accountActivationTokens).where(and(eq(accountActivationTokens.tokenHash, hashToken(rawToken)), isNull(accountActivationTokens.usedAt), gt(accountActivationTokens.expiresAt, new Date()))).for("update").limit(1);
    if (!token) return false;
    const now = new Date();
    const [account] = await tx.select({ status: users.status }).from(users).where(eq(users.id, token.userId)).limit(1);
    if (!account || account.status !== "pending_verification") return false;
    await tx.update(users).set({ passwordHash: await hashPassword(password), status: "active", emailVerifiedAt: sql`coalesce(${users.emailVerifiedAt}, now())`, updatedAt: now }).where(and(eq(users.id, token.userId), eq(users.status, "pending_verification")));
    await tx.update(accountActivationTokens).set({ usedAt: now }).where(eq(accountActivationTokens.id, token.id));
    await tx.insert(securityEvents).values({ userId: token.userId, eventType: "account_activated", metadata: {} });
    return true;
  });
}
