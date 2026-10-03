import { eq } from "drizzle-orm";
import { db } from "@/db";
import { securityEvents, userSessions } from "@/db/schema";
import { logoutRequestSchema, logoutResponseSchema } from "@/lib/api-v1/contracts";
import { apiHandler, jsonResponse, parseJson, parseResponse, requireApiActor } from "@/lib/api-v1/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    await parseJson(request, logoutRequestSchema);
    await db.transaction(async (tx) => {
      await tx.update(userSessions).set({ revokedAt: new Date() }).where(eq(userSessions.id, actor.sessionId));
      await tx.insert(securityEvents).values({ userId: actor.user.id, eventType: "session_revoked", metadata: { scope: "current", transport: "mobile_api" } });
    });
    return jsonResponse(parseResponse(logoutResponseSchema, { data: { revoked: true } }));
  });
}
