import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { db } from "@/db";
import { authIdentities, oauthStates, profiles, securityEvents, users } from "@/db/schema";
import { hashToken, normalizeEmail } from "@/lib/auth/crypto";
import { decideGoogleAccount } from "@/lib/auth/policy";
import { getServerEnv } from "@/lib/env";

export type GoogleIdTokenAuthErrorCode =
  | "GOOGLE_UNAVAILABLE"
  | "INVALID_GOOGLE_CREDENTIAL"
  | "EXPLICIT_LINK_REQUIRED"
  | "ACCOUNT_UNAVAILABLE";

export class GoogleIdTokenAuthError extends Error {
  constructor(readonly code: GoogleIdTokenAuthErrorCode) {
    super(code);
  }
}

/** Authenticate a native Google ID token without accepting client profile data. */
export async function authenticateGoogleIdToken(idToken: string, nonce: string) {
  const clientId = getServerEnv().GOOGLE_CLIENT_ID;
  if (!clientId) throw new GoogleIdTokenAuthError("GOOGLE_UNAVAILABLE");

  let payload;
  try {
    payload = (await new OAuth2Client().verifyIdToken({
      idToken,
      audience: clientId,
    })).getPayload();
  } catch {
    throw new GoogleIdTokenAuthError("INVALID_GOOGLE_CREDENTIAL");
  }
  if (!payload?.sub || !payload.email || payload.email_verified !== true)
    throw new GoogleIdTokenAuthError("INVALID_GOOGLE_CREDENTIAL");
  const tokenNonce = (payload as { nonce?: unknown }).nonce;
  if (tokenNonce !== nonce)
    throw new GoogleIdTokenAuthError("INVALID_GOOGLE_CREDENTIAL");
  const consumed = await db.transaction(async (tx) => {
    const [challenge] = await tx.select({ stateHash: oauthStates.stateHash })
      .from(oauthStates)
      .where(and(
        eq(oauthStates.stateHash, hashToken(nonce)),
        eq(oauthStates.codeVerifier, "native-google-id-token"),
        gt(oauthStates.expiresAt, new Date()),
      ))
      .for("update")
      .limit(1);
    if (!challenge) return false;
    await tx.delete(oauthStates).where(eq(oauthStates.stateHash, challenge.stateHash));
    return true;
  });
  if (!consumed) throw new GoogleIdTokenAuthError("INVALID_GOOGLE_CREDENTIAL");

  const googleEmail = payload.email;
  const normalized = normalizeEmail(googleEmail);
  let createdNewUser = false;
  const userId = await db.transaction(async (tx) => {
    const [identity] = await tx
      .select({ userId: authIdentities.userId })
      .from(authIdentities)
      .where(and(
        eq(authIdentities.provider, "google"),
        eq(authIdentities.providerAccountId, payload.sub),
      ))
      .limit(1);
    const [emailOwner] = identity ? [] : await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.emailNormalized, normalized))
      .limit(1);
    const decision = decideGoogleAccount({
      identityUserId: identity?.userId,
      emailOwnerUserId: emailOwner?.id,
      googleEmail: normalized,
    });
    if (decision === "login_linked_identity") return identity!.userId;
    if (decision === "require_explicit_link")
      throw new GoogleIdTokenAuthError("EXPLICIT_LINK_REQUIRED");
    if (decision !== "create_google_user")
      throw new GoogleIdTokenAuthError("INVALID_GOOGLE_CREDENTIAL");

    const [created] = await tx
      .insert(users)
      .values({
        email: googleEmail,
        emailNormalized: normalized,
        emailVerifiedAt: new Date(),
        status: "active",
      })
      .returning({ id: users.id });
    createdNewUser = true;
    await tx.insert(profiles).values({
      id: created.id,
      avatarUrl: typeof payload.picture === "string" && payload.picture.startsWith("https://")
        ? payload.picture
        : null,
    });
    await tx.insert(authIdentities).values({
      userId: created.id,
      provider: "google",
      providerAccountId: payload.sub,
      providerEmail: googleEmail,
    });
    await tx.insert(securityEvents).values({
      userId: created.id,
      eventType: "account_created",
      metadata: { method: "google_native" },
    });
    return created.id;
  });

  const [account] = await db
    .select({ status: users.status })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);
  if (!account || account.status !== "active")
    throw new GoogleIdTokenAuthError("ACCOUNT_UNAVAILABLE");
  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
    await tx.insert(securityEvents).values({
      userId,
      eventType: "login_success",
      metadata: { method: "google_native" },
    });
  });
  return { userId, createdNewUser };
}
