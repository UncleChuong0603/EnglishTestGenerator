import { timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { db } from "@/db";
import { authIdentities, oauthStates, profiles, securityEvents, users } from "@/db/schema";
import { hashToken, normalizeEmail } from "@/lib/auth/crypto";
import { createSession, getCurrentUser } from "@/lib/auth/session";
import { getServerEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code"); const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) return NextResponse.redirect(new URL("/sign-in?error=oauth_callback_failed", request.url));
  const cookieStore = await cookies(); const stateCookie = cookieStore.get("etg_oauth_state")?.value;
  if (!stateCookie || stateCookie.length !== state.length || !timingSafeEqual(Buffer.from(stateCookie), Buffer.from(state))) return NextResponse.redirect(new URL("/sign-in?error=oauth_callback_failed", request.url));
  cookieStore.delete("etg_oauth_state");
  const env = getServerEnv(); if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return NextResponse.redirect(new URL("/sign-in?error=google_unavailable", request.url));
  const oauthState = await db.transaction(async (tx) => {
    const [row] = await tx.select().from(oauthStates).where(and(eq(oauthStates.stateHash, hashToken(state)), gt(oauthStates.expiresAt, new Date()))).for("update").limit(1);
    if (row) await tx.delete(oauthStates).where(eq(oauthStates.stateHash, row.stateHash));
    return row;
  });
  if (!oauthState) return NextResponse.redirect(new URL("/sign-in?error=oauth_callback_failed", request.url));
  try {
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, `${env.APP_URL}/auth/callback`);
    const { tokens } = await client.getToken({ code, codeVerifier: oauthState.codeVerifier });
    if (!tokens.id_token) throw new Error("Missing ID token");
    const payload = (await client.verifyIdToken({ idToken: tokens.id_token, audience: env.GOOGLE_CLIENT_ID })).getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true) throw new Error("Google email is not verified");
    const googleEmail = payload.email; const normalized = normalizeEmail(googleEmail); const current = await getCurrentUser();
    const userId = await db.transaction(async (tx) => {
      const [identity] = await tx.select().from(authIdentities).where(and(eq(authIdentities.provider, "google"), eq(authIdentities.providerAccountId, payload.sub))).limit(1);
      if (identity) { if (oauthState.linkUserId && identity.userId !== oauthState.linkUserId) throw new Error("GOOGLE_ALREADY_LINKED"); return identity.userId; }
      if (oauthState.linkUserId) {
        if (!current || current.id !== oauthState.linkUserId || current.emailNormalized !== normalized) throw new Error("LINK_AUTH_REQUIRED");
        await tx.insert(authIdentities).values({ userId: current.id, provider: "google", providerAccountId: payload.sub, providerEmail: googleEmail });
        await tx.insert(securityEvents).values({ userId: current.id, eventType: "google_linked", metadata: {} }); return current.id;
      }
      const [emailOwner] = await tx.select({ id: users.id }).from(users).where(eq(users.emailNormalized, normalized)).limit(1);
      if (emailOwner) throw new Error("EXPLICIT_LINK_REQUIRED");
      const [created] = await tx.insert(users).values({ email: googleEmail, emailNormalized: normalized, emailVerifiedAt: new Date(), status: "active" }).returning({ id: users.id });
      await tx.insert(profiles).values({ id: created.id, avatarUrl: typeof payload.picture === "string" && payload.picture.startsWith("https://") ? payload.picture : null });
      await tx.insert(authIdentities).values({ userId: created.id, provider: "google", providerAccountId: payload.sub, providerEmail: googleEmail });
      await tx.insert(securityEvents).values({ userId: created.id, eventType: "account_created", metadata: { method: "google" } }); return created.id;
    });
    const [localUser] = await db.select({ status: users.status }).from(users).where(eq(users.id, userId)).limit(1);
    if (!localUser || localUser.status !== "active") throw new Error("ACCOUNT_DISABLED");
    await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
    await createSession(userId); return NextResponse.redirect(new URL(oauthState.returnTo, request.url));
  } catch (error) {
    const collision = error instanceof Error && error.message === "EXPLICIT_LINK_REQUIRED";
    return NextResponse.redirect(new URL(collision ? "/sign-in?error=link_required" : "/sign-in?error=oauth_callback_failed", request.url));
  }
}
