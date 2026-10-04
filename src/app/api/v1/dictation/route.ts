import {
  dictationCatalogResponseSchema,
  dictationSessionResponseSchema,
  startDictationRequestSchema,
} from "@/lib/api-v1/contracts";
import { mapDictationError } from "@/lib/api-v1/dictation";
import {
  apiHandler,
  jsonResponse,
  parseJson,
  parseResponse,
  requireApiActor,
} from "@/lib/api-v1/http";
import { dictationCatalog, startDictation } from "@/lib/dictation/service";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    return jsonResponse(
      parseResponse(dictationCatalogResponseSchema, {
        data: await dictationCatalog(actor.user.id),
      }),
    );
  });
}
export async function POST(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const body = await parseJson(request, startDictationRequestSchema);
    try {
      return jsonResponse(
        parseResponse(dictationSessionResponseSchema, {
          data: await startDictation(actor.user.id, body.sourceRef),
        }),
        201,
      );
    } catch (error) {
      mapDictationError(error);
    }
  });
}
