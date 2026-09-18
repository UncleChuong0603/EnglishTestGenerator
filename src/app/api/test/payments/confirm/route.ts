import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentOrders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { applyVerifiedPayment } from "@/lib/payments/service";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" || process.env.TASK17_E2E_PAYMENT_ENABLED !== "true" || process.env.PAYMENT_PROVIDER !== "FAKE") return NextResponse.json({ error: "not_found" }, { status: 404 });
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const input = await request.json().catch(() => null) as { orderId?: string } | null; if (!input?.orderId) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const [order] = await db.select().from(paymentOrders).where(and(eq(paymentOrders.id, input.orderId), eq(paymentOrders.userId, user.id), eq(paymentOrders.provider, "FAKE"))).limit(1); if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await applyVerifiedPayment({ eventKey: `e2e:${order.id}`, orderCode: order.orderCode, amountVnd: order.amount, currency: "VND", providerPaymentId: order.providerPaymentId!, paid: true }, "FAKE");
  return NextResponse.json({ ok: true });
}
