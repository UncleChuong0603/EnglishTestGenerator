import { revokePushDeviceResponseSchema, uuidSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, jsonResponse, parseResponse, requireApiActor } from "@/lib/api-v1/http";
import { revokePushDevice } from "@/lib/mobile-retention/service";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const id = uuidSchema.safeParse((await params).id);
    if (!id.success) throw new ApiV1Error(404, "NOT_FOUND", "Push device not found.");
    if (!await revokePushDevice(actor.user.id, id.data)) throw new ApiV1Error(404, "NOT_FOUND", "Push device not found.");
    return jsonResponse(parseResponse(revokePushDeviceResponseSchema, { data: { revoked: true } }));
  });
}
