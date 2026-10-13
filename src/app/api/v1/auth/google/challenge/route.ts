import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { oauthStates } from "@/db/schema";
import { hashToken } from "@/lib/auth/crypto";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { googleLoginChallengeResponseSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, clientIp, jsonResponse, parseResponse } from "@/lib/api-v1/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return apiHandler(async () => {
    try {
      await enforceRateLimit("google_oauth", `mobile-google-challenge:${clientIp(request)}`);
    } catch {
      throw new ApiV1Error(429, "RATE_LIMITED", "Too many sign-in attempts. Please try again later.", undefined, 900);
    }
    const nonce = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60_000);
    await db.insert(oauthStates).values({
      stateHash: hashToken(nonce),
      codeVerifier: "native-google-id-token",
      returnTo: "/",
      expiresAt,
    });
    return jsonResponse(parseResponse(googleLoginChallengeResponseSchema, {
      data: { nonce, expiresAt: expiresAt.toISOString() },
    }));
  });
}
