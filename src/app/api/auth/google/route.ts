import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { CodeChallengeMethod, OAuth2Client } from "google-auth-library";
import { db } from "@/db";
import { oauthStates } from "@/db/schema";
import { hashToken } from "@/lib/auth/crypto";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";
import { getServerEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const env = getServerEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return NextResponse.redirect(new URL("/sign-in?error=google_unavailable", request.url));
  try { await enforceRateLimit("google_oauth", request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"); } catch { return NextResponse.redirect(new URL("/sign-in?error=rate_limited", request.url)); }
  const linkUser = request.nextUrl.searchParams.get("mode") === "link" ? await getCurrentUser() : null;
  const returnParam = request.nextUrl.searchParams.get("next");
  const returnTo = returnParam?.startsWith("/") && !returnParam.startsWith("//") ? returnParam : "/dashboard";
  const state = randomBytes(32).toString("base64url"); const codeVerifier = randomBytes(64).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  await db.insert(oauthStates).values({ stateHash: hashToken(state), codeVerifier, linkUserId: linkUser?.id, returnTo, expiresAt: new Date(Date.now() + 10 * 60_000) });
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, `${env.APP_URL}/auth/callback`);
  const url = client.generateAuthUrl({ access_type: "online", scope: ["openid", "email"], state, code_challenge: codeChallenge, code_challenge_method: CodeChallengeMethod.S256, prompt: "select_account" });
  const response = NextResponse.redirect(url);
  response.cookies.set("etg_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
