import { dictationHistoryResponseSchema } from "@/lib/api-v1/contracts";
import {
  apiHandler,
  jsonResponse,
  parseResponse,
  requireApiActor,
} from "@/lib/api-v1/http";
import { dictationHistory } from "@/lib/dictation/service";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    return jsonResponse(
      parseResponse(dictationHistoryResponseSchema, {
        data: await dictationHistory(actor.user.id),
      }),
    );
  });
}
