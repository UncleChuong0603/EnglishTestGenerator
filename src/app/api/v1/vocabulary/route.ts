import { paginationRequestSchema, vocabularyResponseSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, jsonResponse, parseResponse, requireApiActor } from "@/lib/api-v1/http";
import { vocabularyProjection } from "@/lib/api-v1/projections";

export const dynamic = "force-dynamic";
export async function GET(request: Request) { return apiHandler(async () => { const actor = await requireApiActor(request); const url = new URL(request.url); const parsed = paginationRequestSchema.safeParse({ cursor: url.searchParams.get("cursor") ?? undefined, limit: url.searchParams.get("limit") ?? undefined }); if (!parsed.success) throw new ApiV1Error(400, "VALIDATION_FAILED", "Pagination parameters are invalid."); return jsonResponse(parseResponse(vocabularyResponseSchema, await vocabularyProjection(actor.user.id, parsed.data.cursor, parsed.data.limit))); }); }
