import {
  dictationAttemptRequestSchema,
  dictationAttemptResponseSchema,
  uuidSchema,
} from "@/lib/api-v1/contracts";
import { mapDictationError } from "@/lib/api-v1/dictation";
import { ApiV1Error } from "@/lib/api-v1/errors";
import {
  apiHandler,
  jsonResponse,
  parseJson,
  parseResponse,
  requireApiActor,
} from "@/lib/api-v1/http";
import { submitDictation } from "@/lib/dictation/service";
export const dynamic = "force-dynamic";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const parsed = uuidSchema.safeParse((await context.params).id);
    if (!parsed.success)
      throw new ApiV1Error(
        404,
        "NOT_FOUND",
        "Dictation session was not found.",
      );
    const body = await parseJson(request, dictationAttemptRequestSchema);
    try {
      return jsonResponse(
        parseResponse(dictationAttemptResponseSchema, {
          data: await submitDictation(actor.user.id, parsed.data, body.answer),
        }),
      );
    } catch (error) {
      mapDictationError(error);
    }
  });
}
