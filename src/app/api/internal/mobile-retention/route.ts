import { createHmac, timingSafeEqual } from "node:crypto";
import { getServerEnv } from "@/lib/env";
import { dispatchRetentionPushes, processPushReceipts } from "@/lib/mobile-retention/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = createHmac("sha256", getServerEnv().SESSION_SECRET).update("mobile-retention-job:v1").digest("base64url");
  const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (supplied.length !== secret.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))) return new Response(null, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const [dispatch, receipts] = await Promise.all([dispatchRetentionPushes(), processPushReceipts()]);
    return Response.json({ dispatch, receipts }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Mobile retention job failed", { type: error instanceof Error ? error.name : "unknown" });
    return Response.json({ status: "failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
