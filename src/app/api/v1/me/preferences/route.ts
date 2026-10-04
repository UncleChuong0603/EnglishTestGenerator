import { updatePreferencesRequestSchema, updatePreferencesResponseSchema } from "@/lib/api-v1/contracts";
import { apiHandler, jsonResponse, parseJson, parseResponse, requireApiActor } from "@/lib/api-v1/http";
import { meProjection } from "@/lib/api-v1/projections";
import { updateLearnerPreferences } from "@/lib/preferences/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const body = await parseJson(request, updatePreferencesRequestSchema);
    await updateLearnerPreferences(actor.user.id, body);
    return jsonResponse(parseResponse(updatePreferencesResponseSchema, await meProjection(actor.user.id)));
  });
}
