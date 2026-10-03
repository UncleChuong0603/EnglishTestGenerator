import { createPracticeRequestSchema, createPracticeResponseSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, jsonResponse, parseJson, parseResponse, requireApiActor, requireIdempotencyKey } from "@/lib/api-v1/http";
import { idempotent } from "@/lib/api-v1/idempotency";
import { createPractice, mapPracticeError } from "@/lib/api-v1/practice";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const body = await parseJson(request, createPracticeRequestSchema);
    const key = requireIdempotencyKey(request);
    try { await enforceRateLimit("api_practice_start", actor.user.id); }
    catch { throw new ApiV1Error(429, "RATE_LIMITED", "Too many practice requests. Please try again shortly.", undefined, 60); }
    try {
      const result = await idempotent({ userId: actor.user.id, operation: "practice:create", key, body, status: 201, execute: async (tx) => parseResponse(createPracticeResponseSchema, await createPractice(actor.user.id, body, tx)) });
      return jsonResponse(result.body, result.replayed ? 200 : 201, { "Idempotency-Replayed": String(result.replayed) });
    } catch (error) { mapPracticeError(error); }
  });
}
