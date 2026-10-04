import { notificationPreferencesResponseSchema, updateNotificationPreferencesRequestSchema } from "@/lib/api-v1/contracts";
import { apiHandler, jsonResponse, parseJson, parseResponse, requireApiActor } from "@/lib/api-v1/http";
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/mobile-retention/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    return jsonResponse(parseResponse(notificationPreferencesResponseSchema, { data: await getNotificationPreferences(actor.user.id) }));
  });
}

export async function POST(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const body = await parseJson(request, updateNotificationPreferencesRequestSchema);
    return jsonResponse(parseResponse(notificationPreferencesResponseSchema, { data: await updateNotificationPreferences(actor.user.id, body) }));
  });
}
