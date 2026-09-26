import { createHmac, timingSafeEqual } from "node:crypto";
import { runLifecycleEmails } from "@/lib/email/lifecycle";
import { getServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = createHmac("sha256", getServerEnv().SESSION_SECRET).update("lifecycle-email-job:v1").digest("base64url");
  const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (supplied.length !== secret.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(secret)))
    return new Response(null, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const result = await runLifecycleEmails();
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Lifecycle job failed", { type: error instanceof Error ? error.name : "unknown" });
    return Response.json({ status: "failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
