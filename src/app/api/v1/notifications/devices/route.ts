import { registerPushDeviceRequestSchema, registerPushDeviceResponseSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, jsonResponse, parseJson, parseResponse, requireApiActor } from "@/lib/api-v1/http";
import { PushDeviceOwnershipError, registerPushDevice } from "@/lib/mobile-retention/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const body = await parseJson(request, registerPushDeviceRequestSchema);
    try {
      const id = await registerPushDevice(actor.user.id, body);
      return jsonResponse(parseResponse(registerPushDeviceResponseSchema, { data: { id } }), 201);
    } catch (error) {
      if (error instanceof PushDeviceOwnershipError) throw new ApiV1Error(409, "CONFLICT", "This push token is already registered to another account.");
      throw error;
    }
  });
}
