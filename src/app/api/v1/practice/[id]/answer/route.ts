import { answerPracticeRequestSchema, answerPracticeResponseSchema, uuidSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, jsonResponse, parseJson, parseResponse, requireApiActor, requireIdempotencyKey } from "@/lib/api-v1/http";
import { idempotent } from "@/lib/api-v1/idempotency";
import { mapPracticeError } from "@/lib/api-v1/practice";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { savePracticeAnswerWithTx } from "@/lib/practice/mutations";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const id = uuidSchema.safeParse((await params).id);
    if (!id.success) throw new ApiV1Error(404, "NOT_FOUND", "Practice session not found.");
    const body = await parseJson(request, answerPracticeRequestSchema);
    const key = requireIdempotencyKey(request);
    try { await enforceRateLimit("api_practice_answer", actor.user.id); }
    catch { throw new ApiV1Error(429, "RATE_LIMITED", "Too many answer requests. Please try again shortly.", undefined, 30); }
    try {
      const result = await idempotent({ userId: actor.user.id, operation: `practice:${id.data}:answer`, key, body, execute: async (tx) => {
        const updatedAt = await savePracticeAnswerWithTx(tx, { userId: actor.user.id, sessionId: id.data, ...body });
        return parseResponse(answerPracticeResponseSchema, { data: { accepted: true, questionId: body.questionId, updatedAt: updatedAt.toISOString() } });
      } });
      return jsonResponse(result.body, 200, { "Idempotency-Replayed": String(result.replayed) });
    } catch (error) { mapPracticeError(error); }
  });
}
