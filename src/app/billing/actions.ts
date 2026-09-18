"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createPaymentOrder, reconcileOrder } from "@/lib/payments/service";

export async function createCheckoutAction(formData: FormData) {
  const user = await requireUser(); const productKey = String(formData.get("productKey") ?? "");
  let url: string; try { const order = await createPaymentOrder(user.id, productKey); if (!order.checkoutUrl) throw new Error("NO_CHECKOUT_URL"); url = order.checkoutUrl; } catch { redirect("/billing?error=unavailable"); }
  redirect(url!);
}
export async function recheckOrderAction(formData: FormData) { const user = await requireUser(); const id = String(formData.get("orderId") ?? ""); try { await reconcileOrder(id, user.id); } catch { /* do not expose provider errors */ } redirect(`/billing/return?order=${encodeURIComponent(id)}`); }
