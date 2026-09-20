"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createPaymentOrder, reconcileOrder } from "@/lib/payments/service";
import { recordProductEvent } from "@/lib/product-analytics/service";

export async function createCheckoutAction(formData: FormData) {
  const user = await requireUser(); const productKey = String(formData.get("productKey") ?? "");
  let url: string; try { await recordProductEvent({eventName:"checkout_started",userId:user.id,deduplicationKey:`checkout-start:${user.id}:${productKey}:${Math.floor(Date.now()/1_800_000)}`,properties:{productKey}}); const order = await createPaymentOrder(user.id, productKey); if (!order.checkoutUrl) throw new Error("NO_CHECKOUT_URL"); await recordProductEvent({eventName:"checkout_created",userId:user.id,source:"payment",deduplicationKey:`checkout-created:${order.id}`,properties:{productKey}}); url = order.checkoutUrl; } catch { redirect("/billing?error=unavailable"); }
  redirect(url!);
}
export async function recheckOrderAction(formData: FormData) { const user = await requireUser(); const id = String(formData.get("orderId") ?? ""); try { await reconcileOrder(id, user.id); } catch { /* do not expose provider errors */ } redirect(`/billing/return?order=${encodeURIComponent(id)}`); }
