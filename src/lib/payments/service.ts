import "server-only";
import { randomBytes } from "node:crypto";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { paymentEvents, paymentOrders, userPlanMemberships, users } from "@/db/schema";
import { grantPremiumWithTx } from "@/lib/entitlements/service";
import { resolveProduct } from "./catalog";
import { getPaymentProvider, type VerifiedPayment } from "./provider";

const ORDER_TTL_MS = 30 * 60_000;
function newOrderCode() { return Number(BigInt(`0x${randomBytes(6).toString("hex")}`)); }
function safeOrigin() { const url = new URL(process.env.APP_URL ?? "http://localhost:3000"); if (process.env.NODE_ENV === "production" && (url.protocol !== "https:" || url.hostname !== "toeicgym.net")) throw new Error("INVALID_PAYMENT_ORIGIN"); return url.origin; }

export async function createPaymentOrder(userId: string, productKey: string, provider = getPaymentProvider()) {
  const product = resolveProduct(productKey), now = new Date(), expiresAt = new Date(now.getTime() + ORDER_TTL_MS);
  const reserved = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:${product.key}:checkout`}, 0))`);
    const [existing] = await tx.select().from(paymentOrders).where(and(eq(paymentOrders.userId, userId), eq(paymentOrders.productKey, product.key), eq(paymentOrders.status, "PENDING"), gt(paymentOrders.expiresAt, now))).orderBy(desc(paymentOrders.createdAt)).limit(1);
    if (existing?.checkoutUrl) return { order: existing, reused: true as const };
    const [order] = await tx.insert(paymentOrders).values({ userId, productKey: product.key, provider: provider.name, orderCode: newOrderCode(), amount: product.amountVnd, currency: "VND", expiresAt }).returning();
    return { order, reused: false as const };
  });
  if (reserved.reused) return reserved.order;
  try {
    const origin = safeOrigin(), created = await provider.create({ orderCode: reserved.order.orderCode, amountVnd: product.amountVnd, description: `TG${reserved.order.orderCode}`, returnUrl: `${origin}/billing/return?order=${reserved.order.id}`, cancelUrl: `${origin}/billing/cancel?order=${reserved.order.id}`, expiresAt });
    const [updated] = await db.update(paymentOrders).set({ checkoutUrl: created.checkoutUrl, providerPaymentId: created.providerPaymentId, updatedAt: new Date() }).where(eq(paymentOrders.id, reserved.order.id)).returning(); return updated;
  } catch (error) { await db.update(paymentOrders).set({ status: "FAILED", updatedAt: new Date() }).where(eq(paymentOrders.id, reserved.order.id)); throw error; }
}

export async function applyVerifiedPayment(event: VerifiedPayment, providerName: "PAYOS" | "FAKE", injectFailure = false) {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(paymentOrders).where(and(eq(paymentOrders.orderCode, event.orderCode), eq(paymentOrders.provider, providerName))).for("update").limit(1);
    if (!order) throw new Error("PAYMENT_ORDER_NOT_FOUND");
    const inserted = await tx.insert(paymentEvents).values({ provider: providerName, providerEventKey: event.eventKey, orderId: order.id, eventType: event.paid ? "PAYMENT_SUCCEEDED" : "PAYMENT_FAILED", metadata: { orderCode: event.orderCode, amount: event.amountVnd, currency: event.currency, reference: event.providerPaymentId } }).onConflictDoNothing().returning({ id: paymentEvents.id });
    if (!inserted.length || order.status === "PAID") return { status: order.status, duplicate: true };
    if (!event.paid || event.amountVnd !== order.amount || event.currency !== order.currency || event.providerPaymentId !== order.providerPaymentId) {
      await tx.update(paymentEvents).set({ processingStatus: "REJECTED", processedAt: new Date() }).where(eq(paymentEvents.id, inserted[0].id)); return { status: order.status, rejected: true };
    }
    const product = resolveProduct(order.productKey);
    await grantPremiumWithTx(tx, { userId: order.userId, days: product.days, source: "PAYMENT", paymentOrderId: order.id });
    if (injectFailure) throw new Error("INJECTED_ROLLBACK");
    const now = new Date(); await tx.update(paymentOrders).set({ status: "PAID", paidAt: now, updatedAt: now }).where(eq(paymentOrders.id, order.id));
    await tx.update(paymentEvents).set({ processingStatus: "PROCESSED", processedAt: now }).where(eq(paymentEvents.id, inserted[0].id));
    return { status: "PAID" as const, duplicate: false };
  });
}

export async function processWebhook(body: unknown, provider = getPaymentProvider()) {
  const event = await provider.verifyWebhook(body);
  try { return await applyVerifiedPayment(event, provider.name); }
  catch (error) {
    if (!(error instanceof Error) || error.message !== "PAYMENT_ORDER_NOT_FOUND") throw error;
    await db.insert(paymentEvents).values({ provider: provider.name, providerEventKey: event.eventKey, eventType: "UNMATCHED_VERIFIED_EVENT", processingStatus: "REJECTED", processedAt: new Date(), metadata: { orderCode: event.orderCode, amount: event.amountVnd, currency: event.currency, reference: event.providerPaymentId } }).onConflictDoNothing();
    return { status: "UNMATCHED", rejected: true };
  }
}
export async function reconcileOrder(orderId: string, actorUserId: string, provider = getPaymentProvider()) {
  const [order] = await db.select().from(paymentOrders).where(eq(paymentOrders.id, orderId)).limit(1); if (!order || order.userId !== actorUserId || order.provider !== provider.name) throw new Error("ORDER_NOT_FOUND");
  const result = await provider.getStatus(order.orderCode); if (result.status === "PAID") return applyVerifiedPayment({ eventKey: `reconcile:${order.orderCode}:${result.providerPaymentId}`, orderCode: order.orderCode, amountVnd: result.amountVnd, currency: "VND", providerPaymentId: result.providerPaymentId, paid: true }, provider.name);
  if (result.status !== "PENDING") await db.update(paymentOrders).set({ status: result.status, updatedAt: new Date(), cancelledAt: result.status === "CANCELLED" ? new Date() : null }).where(and(eq(paymentOrders.id, order.id), eq(paymentOrders.status, "PENDING")));
  return { status: result.status };
}
export async function cancelOrder(orderId: string, actorUserId: string, provider = getPaymentProvider()) {
  const [order] = await db.select().from(paymentOrders).where(and(eq(paymentOrders.id, orderId), eq(paymentOrders.userId, actorUserId), eq(paymentOrders.status, "PENDING"))).limit(1);
  if (!order || order.provider !== provider.name) throw new Error("ORDER_NOT_FOUND");
  const status = await provider.cancel(order.orderCode); const now = new Date();
  if (status === "CANCELLED") await db.update(paymentOrders).set({ status: "CANCELLED", cancelledAt: now, updatedAt: now }).where(and(eq(paymentOrders.id, order.id), eq(paymentOrders.status, "PENDING")));
  return status;
}
export async function listUserOrders(userId: string) { return db.select().from(paymentOrders).where(eq(paymentOrders.userId, userId)).orderBy(desc(paymentOrders.createdAt)).limit(20); }
export async function getUserOrder(userId: string, id: string) { const identity = /^\d+$/.test(id) ? eq(paymentOrders.orderCode, Number(id)) : eq(paymentOrders.id, id); const [row] = await db.select().from(paymentOrders).where(and(identity, eq(paymentOrders.userId, userId))).limit(1); return row ?? null; }
export async function getPremiumExpiry(userId: string) { const [row] = await db.select({ endsAt: userPlanMemberships.endsAt }).from(userPlanMemberships).where(and(eq(userPlanMemberships.userId, userId), sql`${userPlanMemberships.revokedAt} is null`, gt(userPlanMemberships.endsAt, new Date()))).orderBy(sql`${userPlanMemberships.endsAt} desc nulls first`).limit(1); return row?.endsAt ?? null; }
export async function listAdminPayments(search: string, page: number) { const q = search.trim().toLowerCase().slice(0, 200); return db.select({ id: paymentOrders.id, email: users.email, productKey: paymentOrders.productKey, amount: paymentOrders.amount, status: paymentOrders.status, provider: paymentOrders.provider, providerPaymentId: paymentOrders.providerPaymentId, createdAt: paymentOrders.createdAt, paidAt: paymentOrders.paidAt }).from(paymentOrders).innerJoin(users, eq(users.id, paymentOrders.userId)).where(q ? sql`${users.emailNormalized} like ${`%${q}%`}` : undefined).orderBy(desc(paymentOrders.createdAt)).limit(30).offset((Math.max(1, page) - 1) * 30); }
