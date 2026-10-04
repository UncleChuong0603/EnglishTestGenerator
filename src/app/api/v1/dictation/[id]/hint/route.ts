import {
  dictationHintResponseSchema,
  uuidSchema,
} from "@/lib/api-v1/contracts";
import { mapDictationError } from "@/lib/api-v1/dictation";
import { ApiV1Error } from "@/lib/api-v1/errors";
import {
  apiHandler,
  jsonResponse,
  parseResponse,
  requireApiActor,
} from "@/lib/api-v1/http";
import { revealDictationHint } from "@/lib/dictation/service";
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
    try {
      return jsonResponse(
        parseResponse(dictationHintResponseSchema, {
          data: await revealDictationHint(actor.user.id, parsed.data),
        }),
      );
    } catch (error) {
      mapDictationError(error);
    }
  });
}
