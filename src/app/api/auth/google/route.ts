import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { CodeChallengeMethod, OAuth2Client } from "google-auth-library";
import { db } from "@/db";
import { oauthStates } from "@/db/schema";
import { hashToken } from "@/lib/auth/crypto";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";
import { getServerEnv } from "@/lib/env";
import { safeInternalReturnTo } from "@/lib/auth/redirect";

export async function GET(request: NextRequest) {
  const env = getServerEnv();
  const appUrl = new URL(env.APP_URL);
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return NextResponse.redirect(new URL("/sign-in?error=google_unavailable", appUrl));
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  try { await enforceRateLimit("google_oauth", clientIp); } catch (error) {
    if (!(error instanceof Error && error.message === "RATE_LIMITED")) console.error("[auth:google_start]", error);
    return NextResponse.redirect(new URL(error instanceof Error && error.message === "RATE_LIMITED" ? "/sign-in?error=rate_limited" : "/sign-in?error=google_start_failed", appUrl));
  }
  const linkUser = request.nextUrl.searchParams.get("mode") === "link" ? await getCurrentUser() : null;
  const returnParam = request.nextUrl.searchParams.get("next");
  const returnTo = safeInternalReturnTo(returnParam);
  const state = randomBytes(32).toString("base64url"); const codeVerifier = randomBytes(64).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  try {
    await db.insert(oauthStates).values({ stateHash: hashToken(state), codeVerifier, linkUserId: linkUser?.id, returnTo, expiresAt: new Date(Date.now() + 10 * 60_000) });
  } catch (error) {
    console.error("[auth:google_start] Could not persist OAuth state", error);
    return NextResponse.redirect(new URL("/sign-in?error=google_start_failed", appUrl));
  }
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, `${env.APP_URL}/auth/callback`);
  const url = client.generateAuthUrl({ access_type: "online", scope: ["openid", "email"], state, code_challenge: codeChallenge, code_challenge_method: CodeChallengeMethod.S256, prompt: "select_account" });
  const response = NextResponse.redirect(url);
  response.cookies.set("etg_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
