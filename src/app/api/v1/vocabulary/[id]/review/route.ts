import { reviewVocabularyRequestSchema, reviewVocabularyResponseSchema, uuidSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, jsonResponse, parseJson, parseResponse, requireApiActor, requireIdempotencyKey } from "@/lib/api-v1/http";
import { idempotent } from "@/lib/api-v1/idempotency";
import { reviewVocabulary } from "@/lib/vocabulary/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const id = uuidSchema.safeParse((await params).id);
    if (!id.success) throw new ApiV1Error(404, "NOT_FOUND", "Vocabulary card not found.");
    const body = await parseJson(request, reviewVocabularyRequestSchema);
    const key = requireIdempotencyKey(request);
    const result = await idempotent({ userId: actor.user.id, operation: `vocabulary:review:${id.data}`, key, body, execute: async (tx) => {
      if (!await reviewVocabulary(actor.user.id, id.data, body.remembered, tx)) throw new ApiV1Error(409, "CONFLICT", "This card is not due or is no longer available.");
      return parseResponse(reviewVocabularyResponseSchema, { data: { reviewed: true } });
    } });
    return jsonResponse(result.body, 200, { "Idempotency-Replayed": String(result.replayed) });
  });
}
