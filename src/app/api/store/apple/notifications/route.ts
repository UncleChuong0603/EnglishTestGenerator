import { readBoundedJson, RequestBodyError } from "@/lib/http/bounded-json";
import { processAppleNotification } from "@/lib/store-billing/service";
import { StoreVerificationError } from "@/lib/store-billing/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const body = (await readBoundedJson(request, 256 * 1024)) as {
      signedPayload?: unknown;
    };
    if (typeof body.signedPayload !== "string")
      return Response.json({ error: "invalid_request" }, { status: 400 });
    await processAppleNotification(body.signedPayload);
    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof RequestBodyError)
      return Response.json(
        { error: "invalid_request" },
        { status: error.code === "BODY_TOO_LARGE" ? 413 : 400 },
      );
    if (
      error instanceof StoreVerificationError &&
      error.code !== "STORE_NOT_CONFIGURED"
    )
      return Response.json({ error: "invalid_notification" }, { status: 400 });
    console.error("apple_store_notification_failed", {
      type: error instanceof Error ? error.name : "unknown",
    });
    return Response.json({ error: "temporarily_unavailable" }, { status: 503 });
  }
}
