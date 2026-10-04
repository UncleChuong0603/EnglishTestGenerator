import { readBoundedJson, RequestBodyError } from "@/lib/http/bounded-json";
import { verifyGooglePushIdentity } from "@/lib/store-billing/google";
import { processGoogleNotification } from "@/lib/store-billing/service";
import { StoreVerificationError } from "@/lib/store-billing/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Envelope = { message?: { messageId?: unknown; data?: unknown } };
export async function POST(request: Request) {
  try {
    await verifyGooglePushIdentity(request.headers.get("authorization"));
    const envelope = (await readBoundedJson(request, 256 * 1024)) as Envelope;
    if (
      typeof envelope.message?.messageId !== "string" ||
      typeof envelope.message.data !== "string"
    )
      return Response.json({ error: "invalid_request" }, { status: 400 });
    let notification: {
      packageName?: unknown;
      subscriptionNotification?: {
        purchaseToken?: unknown;
        notificationType?: unknown;
      };
    };
    try {
      notification = JSON.parse(
        Buffer.from(envelope.message.data, "base64").toString("utf8"),
      );
    } catch {
      return Response.json({ error: "invalid_request" }, { status: 400 });
    }
    const subscription = notification.subscriptionNotification;
    if (
      typeof notification.packageName !== "string" ||
      typeof subscription?.purchaseToken !== "string" ||
      typeof subscription.notificationType !== "number"
    )
      return Response.json(
        { error: "unsupported_notification" },
        { status: 400 },
      );
    await processGoogleNotification({
      messageId: envelope.message.messageId,
      packageName: notification.packageName,
      purchaseToken: subscription.purchaseToken,
      notificationType: subscription.notificationType,
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof RequestBodyError)
      return Response.json(
        { error: "invalid_request" },
        { status: error.code === "BODY_TOO_LARGE" ? 413 : 400 },
      );
    if (
      error instanceof StoreVerificationError &&
      error.code === "INVALID_STORE_PROOF"
    )
      return Response.json({ error: "unauthorized" }, { status: 401 });
    if (
      error instanceof StoreVerificationError &&
      error.code === "ACCOUNT_MISMATCH"
    )
      return Response.json(
        { error: "purchase_not_registered" },
        { status: 409 },
      );
    console.error("google_store_notification_failed", {
      type: error instanceof Error ? error.name : "unknown",
    });
    return Response.json({ error: "temporarily_unavailable" }, { status: 503 });
  }
}
