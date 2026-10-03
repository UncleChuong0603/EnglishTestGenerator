import { dashboardResponseSchema } from "@/lib/api-v1/contracts";
import { apiHandler, jsonResponse, parseResponse, requireApiActor } from "@/lib/api-v1/http";
import { dashboardProjection } from "@/lib/api-v1/projections";

export const dynamic = "force-dynamic";
export async function GET(request: Request) { return apiHandler(async () => { const actor = await requireApiActor(request); return jsonResponse(parseResponse(dashboardResponseSchema, await dashboardProjection(actor.user.id))); }); }
