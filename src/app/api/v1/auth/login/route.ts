import { authenticatePassword } from "@/lib/auth/service";
import { issueSessionToken } from "@/lib/auth/session-core";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { normalizeEmail } from "@/lib/auth/crypto";
import { loginRequestSchema, loginResponseSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, clientIp, jsonResponse, parseJson, parseResponse } from "@/lib/api-v1/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return apiHandler(async () => {
    const body = await parseJson(request, loginRequestSchema);
    try {
      await Promise.all([
        enforceRateLimit("login", `mobile-ip:${clientIp(request)}`),
        enforceRateLimit("login", `mobile-identity:${normalizeEmail(body.email)}`),
      ]);
    } catch {
      throw new ApiV1Error(429, "RATE_LIMITED", "Too many sign-in attempts. Please try again later.", undefined, 900);
    }
    const user = await authenticatePassword(body.email, body.password);
    if (!user) throw new ApiV1Error(401, "UNAUTHENTICATED", "Email or password is incorrect, or the account is unavailable.");
    const session = await issueSessionToken(user.id);
    return jsonResponse(parseResponse(loginResponseSchema, { data: { token: session.token, expiresAt: session.expiresAt.toISOString() } }));
  });
}
