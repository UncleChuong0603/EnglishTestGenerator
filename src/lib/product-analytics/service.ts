import "server-only";
import { db } from "@/db";
import { productEvents } from "@/db/schema";
import { safePropertiesSchema, type ProductEventName } from "./catalog";

export type ProductActor = { userId?: string; guestReference?: string };

export async function recordProductEvent(input: ProductActor & { eventName: ProductEventName; source?: "browser" | "server" | "payment"; route?: string; sessionId?: string; deduplicationKey?: string; properties?: Record<string, unknown> }) {
  try {
    const properties = safePropertiesSchema.parse(input.properties ?? {});
    await db.insert(productEvents).values({ eventName: input.eventName, userId: "userId" in input ? input.userId : null, guestReference: "guestReference" in input ? input.guestReference : null, source: input.source ?? "server", route: input.route?.slice(0, 160), sessionId: input.sessionId, deduplicationKey: input.deduplicationKey?.slice(0, 160), properties }).onConflictDoNothing();
    return true;
  } catch (error) {
    console.error("[product-analytics] event insert failed", { eventName: input.eventName, error: error instanceof Error ? error.message : "unknown" });
    return false;
  }
}
