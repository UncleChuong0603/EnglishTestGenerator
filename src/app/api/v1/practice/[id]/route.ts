import { getPracticeResponseSchema, uuidSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, jsonResponse, parseResponse, requireApiActor } from "@/lib/api-v1/http";
import { practiceProjection } from "@/lib/api-v1/projections";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const parsed = uuidSchema.safeParse((await params).id);
    if (!parsed.success) throw new ApiV1Error(404, "NOT_FOUND", "Practice session not found.");
    return jsonResponse(parseResponse(getPracticeResponseSchema, await practiceProjection(actor.user.id, parsed.data)));
  });
}
