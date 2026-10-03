import { saveMistakeReasonRequestSchema, saveMistakeReasonResponseSchema, uuidSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, jsonResponse, parseJson, parseResponse, requireApiActor } from "@/lib/api-v1/http";
import { MistakeReasonError, saveUserMistakeReason } from "@/lib/mistake-reasons/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const id = uuidSchema.safeParse((await params).id);
    if (!id.success) throw new ApiV1Error(404, "NOT_FOUND", "Practice session not found.");
    const body = await parseJson(request, saveMistakeReasonRequestSchema);
    try {
      const saved = await saveUserMistakeReason({ userId: actor.user.id, sessionId: id.data, questionId: body.questionId, reasonCode: body.reasonCode });
      return jsonResponse(parseResponse(saveMistakeReasonResponseSchema, { data: { questionId: body.questionId, reasonCode: saved.reasonCode, evidenceSource: saved.evidenceSource } }));
    } catch (error) {
      if (error instanceof MistakeReasonError) {
        if (error.code === "INVALID_REASON") throw new ApiV1Error(400, "VALIDATION_FAILED", "The reason is not applicable to this question.");
        if (error.code === "NOT_WRONG") throw new ApiV1Error(409, "CONFLICT", "Only an incorrect answer can be classified.");
        throw new ApiV1Error(404, "NOT_FOUND", "Practice answer not found.");
      }
      throw error;
    }
  });
}
