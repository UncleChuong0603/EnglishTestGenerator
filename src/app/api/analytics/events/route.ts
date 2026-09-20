import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { browserEventSchema } from "@/lib/product-analytics/catalog";
import { resolveProductActor } from "@/lib/product-analytics/actor";
import { recordProductEvent } from "@/lib/product-analytics/service";

export async function POST(request: Request) {
  try {
    await enforceRateLimit("product_analytics", request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown");
    const parsed = browserEventSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
    await recordProductEvent({ ...await resolveProductActor(), ...parsed.data, source: "browser" });
    return Response.json({ ok: true }, { status: 202 });
  } catch {
    return Response.json({ ok: false }, { status: 429 });
  }
}
