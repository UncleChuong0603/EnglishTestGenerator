import "server-only";
import { randomBytes } from "node:crypto";
import { and, desc, eq, gt, sql, count, or, gte } from "drizzle-orm";
import { db } from "@/db";
import { paymentEvents, paymentOrders, userPlanMemberships, users } from "@/db/schema";
import { grantPremiumWithTx } from "@/lib/entitlements/service";
import { resolveProduct, resolveProductDuration } from "./catalog";
import { getPaymentProvider, type VerifiedPayment } from "./provider";
import { getMembershipState } from "@/lib/entitlements/service";
import { quoteResultingExpiry } from "@/lib/premium/lifecycle";

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

export async function getRenewalQuote(userId: string, productKey: string, now = new Date()) {
  const product = resolveProduct(productKey);
  const membership = await getMembershipState(userId, now);
  return {
    productKey: product.key,
    durationDays: product.days,
    amount: product.amountVnd,
    currency: product.currency,
    currentExpiry: membership.status === "ACTIVE" ? membership.expiresAt : null,
    resultingExpiry: quoteResultingExpiry(membership, product.days, now),
    membershipStatus: membership.status,
  };
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
    const days = resolveProductDuration(order.productKey);
    await grantPremiumWithTx(tx, { userId: order.userId, days, source: "PAYMENT", paymentOrderId: order.id });
    if (injectFailure) throw new Error("INJECTED_ROLLBACK");
    const now = new Date(); await tx.update(paymentOrders).set({ status: "PAID", paidAt: now, updatedAt: now }).where(eq(paymentOrders.id, order.id));
    await tx.update(paymentEvents).set({ processingStatus: "PROCESSED", processedAt: now }).where(eq(paymentEvents.id, inserted[0].id));
    return { status: "PAID" as const, duplicate: false };
  });
}

export async function processWebhook(body: unknown, provider = getPaymentProvider()) {
  let event: VerifiedPayment;
  try { event = await provider.verifyWebhook(body); }
  catch { throw new PaymentWebhookError("VERIFICATION_FAILED"); }
  try { return await applyVerifiedPayment(event, provider.name); }
  catch (error) {
    if (!(error instanceof Error) || error.message !== "PAYMENT_ORDER_NOT_FOUND") throw error;
    console.info("payment_webhook_verified_unmatched", { provider: provider.name, orderCode: event.orderCode });
    return { status: "UNMATCHED", rejected: true };
  }
}
export class PaymentWebhookError extends Error { constructor(readonly code: "VERIFICATION_FAILED") { super(code); this.name="PaymentWebhookError"; } }
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
export async function getPaidOrderResult(userId: string, id: string) {
  const order = await getUserOrder(userId, id);
  if (!order || order.status !== "PAID") return { order, resultingExpiry: null };
  const [membership] = await db.select({ endsAt: userPlanMemberships.endsAt }).from(userPlanMemberships).where(and(eq(userPlanMemberships.userId, userId), eq(userPlanMemberships.paymentOrderId, order.id))).limit(1);
  return { order, resultingExpiry: membership?.endsAt ?? null };
}
export async function getPremiumExpiry(userId: string) { const [row] = await db.select({ endsAt: userPlanMemberships.endsAt }).from(userPlanMemberships).where(and(eq(userPlanMemberships.userId, userId), sql`${userPlanMemberships.revokedAt} is null`, gt(userPlanMemberships.endsAt, new Date()))).orderBy(sql`${userPlanMemberships.endsAt} desc nulls first`).limit(1); return row?.endsAt ?? null; }
export type AdminPaymentFilters = { q?: string; status?: string; product?: string; days?: string; page?: number };
export async function listAdminPayments(filters: AdminPaymentFilters) {
  const q = (filters.q ?? "").trim().toLowerCase().slice(0, 100);
  const status = ["PENDING", "PAID", "EXPIRED", "CANCELLED", "FAILED"].includes(filters.status ?? "") ? filters.status : undefined;
  const product = ["PREMIUM_30_DAYS", "PREMIUM_90_DAYS", "PREMIUM_365_DAYS"].includes(filters.product ?? "") ? filters.product : undefined;
  const days = ["7", "30", "90"].includes(filters.days ?? "") ? Number(filters.days) : undefined;
  const page = Math.min(100000, Math.max(1, filters.page ?? 1));
  const search = q ? or(sql`${users.emailNormalized} like ${`%${q}%`}`, sql`cast(${paymentOrders.orderCode} as text) like ${`%${q}%`}`, /^[0-9a-f-]{36}$/i.test(q) ? eq(paymentOrders.id, q) : undefined) : undefined;
  const where = and(search, status ? eq(paymentOrders.status, status) : undefined, product ? eq(paymentOrders.productKey, product) : undefined, days ? gte(paymentOrders.createdAt, new Date(Date.now() - days * 86400000)) : undefined);
  const base = db.select({ id: paymentOrders.id, orderCode: paymentOrders.orderCode, email: users.email, productKey: paymentOrders.productKey, amount: paymentOrders.amount, currency: paymentOrders.currency, status: paymentOrders.status, createdAt: paymentOrders.createdAt, paidAt: paymentOrders.paidAt }).from(paymentOrders).innerJoin(users, eq(users.id, paymentOrders.userId));
  const [rows, totals, summary] = await Promise.all([
    base.where(where).orderBy(desc(paymentOrders.createdAt)).limit(30).offset((page - 1) * 30),
    db.select({ total: count() }).from(paymentOrders).innerJoin(users, eq(users.id, paymentOrders.userId)).where(where),
    db.select({ status: paymentOrders.status, total: count() }).from(paymentOrders).groupBy(paymentOrders.status),
  ]);
  return { rows, total: totals[0]?.total ?? 0, summary: Object.fromEntries(summary.map(item => [item.status, item.total])), page, pageSize: 30 };
}
export async function getAdminPayment(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [order] = await db.select({ id: paymentOrders.id, orderCode: paymentOrders.orderCode, userId: paymentOrders.userId, email: users.email, productKey: paymentOrders.productKey, amount: paymentOrders.amount, currency: paymentOrders.currency, status: paymentOrders.status, provider: paymentOrders.provider, providerPaymentId: paymentOrders.providerPaymentId, createdAt: paymentOrders.createdAt, expiresAt: paymentOrders.expiresAt, paidAt: paymentOrders.paidAt, cancelledAt: paymentOrders.cancelledAt }).from(paymentOrders).innerJoin(users, eq(users.id, paymentOrders.userId)).where(eq(paymentOrders.id, id)).limit(1);
  if (!order) return null;
  const [membership, events] = await Promise.all([
    db.select({ startsAt: userPlanMemberships.startsAt, endsAt: userPlanMemberships.endsAt, revokedAt: userPlanMemberships.revokedAt }).from(userPlanMemberships).where(eq(userPlanMemberships.paymentOrderId, id)).limit(1),
    db.select({ eventType: paymentEvents.eventType, processingStatus: paymentEvents.processingStatus, receivedAt: paymentEvents.receivedAt }).from(paymentEvents).where(eq(paymentEvents.orderId, id)).orderBy(desc(paymentEvents.receivedAt)).limit(10),
  ]);
  return { order, membership: membership[0] ?? null, events };
}
