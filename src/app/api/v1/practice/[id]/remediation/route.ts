import { startRemediationRequestSchema, startRemediationResponseSchema, uuidSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, jsonResponse, parseJson, parseResponse, requireApiActor, requireIdempotencyKey } from "@/lib/api-v1/http";
import { idempotent } from "@/lib/api-v1/idempotency";
import { mapPracticeError } from "@/lib/api-v1/practice";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { createFocusedRemediationSession } from "@/lib/practice/selector";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const sourceSessionId = uuidSchema.safeParse((await params).id);
    if (!sourceSessionId.success) throw new ApiV1Error(404, "NOT_FOUND", "Practice result not found.");
    const body = await parseJson(request, startRemediationRequestSchema);
    const key = requireIdempotencyKey(request);
    try { await enforceRateLimit("api_practice_start", actor.user.id); }
    catch { throw new ApiV1Error(429, "RATE_LIMITED", "Too many practice requests. Please try again shortly.", undefined, 60); }
    try {
      const result = await idempotent({
        userId: actor.user.id,
        operation: `practice:${sourceSessionId.data}:${body.questionId}:remediation`,
        key,
        body,
        status: 201,
        execute: async () => parseResponse(startRemediationResponseSchema, {
          data: await createFocusedRemediationSession(actor.user.id, sourceSessionId.data, body.questionId),
        }),
      });
      return jsonResponse(result.body, result.replayed ? 200 : 201, { "Idempotency-Replayed": String(result.replayed) });
    } catch (error) { mapPracticeError(error); }
  });
}
