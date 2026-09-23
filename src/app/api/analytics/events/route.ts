import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { browserEventSchema } from "@/lib/product-analytics/catalog";
import { resolveProductActor } from "@/lib/product-analytics/actor";
import { recordProductEvent } from "@/lib/product-analytics/service";
import { requireGuestOwnerHash } from "@/lib/guest/identity";
import { readBoundedJson, RequestBodyError } from "@/lib/http/bounded-json";

export async function POST(request: Request) {
  try {
    await enforceRateLimit("product_analytics", request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown");
    const parsed = browserEventSchema.safeParse(await readBoundedJson(request, 8 * 1024));
    if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
    if ((parsed.data.eventName === "challenge_viewed") !== (parsed.data.route === "/challenge/part-5")) return Response.json({ ok: false }, { status: 400 });
    const actor = await resolveProductActor();
    await recordProductEvent({ ...(parsed.data.eventName === "challenge_viewed" && !("userId" in actor) ? { guestReference: await requireGuestOwnerHash() } : actor), ...parsed.data, source: "browser" });
    return Response.json({ ok: true }, { status: 202 });
  } catch (error) {
    if (error instanceof RequestBodyError) return Response.json({ ok: false }, { status: error.code === "BODY_TOO_LARGE" ? 413 : 400 });
    return Response.json({ ok: false }, { status: 429 });
  }
}
