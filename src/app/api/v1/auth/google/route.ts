import { hashToken } from "@/lib/auth/crypto";
import {
  GoogleIdTokenAuthError,
  authenticateGoogleIdToken,
} from "@/lib/auth/google-id-token";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { issueSessionToken } from "@/lib/auth/session-core";
import { googleLoginRequestSchema, loginResponseSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, clientIp, jsonResponse, parseJson, parseResponse } from "@/lib/api-v1/http";
import { recordProductEvent } from "@/lib/product-analytics/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return apiHandler(async () => {
    const body = await parseJson(request, googleLoginRequestSchema);
    try {
      await Promise.all([
        enforceRateLimit("google_oauth", `mobile-google-ip:${clientIp(request)}`),
        enforceRateLimit("google_oauth", `mobile-google-token:${hashToken(body.idToken).slice(0, 32)}`),
      ]);
    } catch {
      throw new ApiV1Error(429, "RATE_LIMITED", "Too many sign-in attempts. Please try again later.", undefined, 900);
    }

    try {
      const result = await authenticateGoogleIdToken(body.idToken, body.nonce);
      const session = await issueSessionToken(result.userId);
      try {
        if (result.createdNewUser) {
          await recordProductEvent({
            eventName: "signup_completed",
            userId: result.userId,
            deduplicationKey: `google-native-signup:${result.userId}`,
          });
        }
        await recordProductEvent({
          eventName: "login_completed",
          userId: result.userId,
          deduplicationKey: `google-native-login:${result.userId}:${Math.floor(Date.now() / 1_800_000)}`,
        });
      } catch (error) {
        console.error("[product-analytics] native Google login", error);
      }
      return jsonResponse(parseResponse(loginResponseSchema, {
        data: { token: session.token, expiresAt: session.expiresAt.toISOString() },
      }));
    } catch (error) {
      if (error instanceof GoogleIdTokenAuthError) {
        if (error.code === "EXPLICIT_LINK_REQUIRED")
          throw new ApiV1Error(409, "CONFLICT", "Sign in with your existing method, then link Google from account settings.");
        if (error.code === "GOOGLE_UNAVAILABLE")
          throw new ApiV1Error(503, "INTERNAL_ERROR", "Google sign-in is not available yet.");
        throw new ApiV1Error(401, "UNAUTHENTICATED", "The Google credential is invalid or the account is unavailable.");
      }
      throw error;
    }
  });
}
