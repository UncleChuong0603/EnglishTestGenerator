import { reviewVocabularyRequestSchema, reviewVocabularyResponseSchema, uuidSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, jsonResponse, parseJson, parseResponse, requireApiActor } from "@/lib/api-v1/http";
import { reviewVocabulary } from "@/lib/vocabulary/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const id = uuidSchema.safeParse((await params).id);
    if (!id.success) throw new ApiV1Error(404, "NOT_FOUND", "Vocabulary card not found.");
    const body = await parseJson(request, reviewVocabularyRequestSchema);
    if (!await reviewVocabulary(actor.user.id, id.data, body.remembered)) {
      throw new ApiV1Error(409, "CONFLICT", "This card is not due or is no longer available.");
    }
    return jsonResponse(parseResponse(reviewVocabularyResponseSchema, { data: { reviewed: true } }));
  });
}
