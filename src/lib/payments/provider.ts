import "server-only";
import { PayOS } from "@payos/node";

export type ProviderStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | "FAILED";
export type VerifiedPayment = { eventKey: string; orderCode: number; amountVnd: number; currency: "VND"; providerPaymentId: string; paid: boolean };
export interface PaymentProvider {
  readonly name: "PAYOS" | "FAKE";
  create(input: { orderCode: number; amountVnd: number; description: string; returnUrl: string; cancelUrl: string; expiresAt: Date }): Promise<{ checkoutUrl: string; providerPaymentId: string }>;
  verifyWebhook(body: unknown): Promise<VerifiedPayment>;
  getStatus(orderCode: number): Promise<{ status: ProviderStatus; amountVnd: number; providerPaymentId: string }>;
  cancel(orderCode: number): Promise<ProviderStatus>;
}

function mapStatus(status: string): ProviderStatus {
  if (status === "PAID") return "PAID"; if (status === "CANCELLED") return "CANCELLED"; if (status === "EXPIRED") return "EXPIRED"; if (status === "FAILED" || status === "UNDERPAID") return "FAILED"; return "PENDING";
}

export class PayOSPaymentProvider implements PaymentProvider {
  readonly name = "PAYOS" as const;
  private client: Pick<PayOS, "paymentRequests" | "webhooks">;
  constructor(credentials: { clientId: string; apiKey: string; checksumKey: string }, client?: Pick<PayOS, "paymentRequests" | "webhooks">) { this.client = client ?? new PayOS({ ...credentials, logger: null }); }
  async create(input: Parameters<PaymentProvider["create"]>[0]) {
    const data = await this.client.paymentRequests.create({ orderCode: input.orderCode, amount: input.amountVnd, description: input.description, returnUrl: input.returnUrl, cancelUrl: input.cancelUrl, expiredAt: Math.floor(input.expiresAt.getTime() / 1000) });
    return { checkoutUrl: data.checkoutUrl, providerPaymentId: data.paymentLinkId };
  }
  async verifyWebhook(body: unknown) {
    const data = await this.client.webhooks.verify(body as never);
    if (data.currency !== "VND") throw new Error("INVALID_CURRENCY");
    return { eventKey: `${data.orderCode}:${data.reference}`, orderCode: data.orderCode, amountVnd: data.amount, currency: "VND" as const, providerPaymentId: data.paymentLinkId, paid: data.code === "00" };
  }
  async getStatus(orderCode: number) { const data = await this.client.paymentRequests.get(orderCode); return { status: mapStatus(data.status), amountVnd: data.amount, providerPaymentId: data.id }; }
  async cancel(orderCode: number) { return mapStatus((await this.client.paymentRequests.cancel(orderCode, "Customer cancelled checkout")).status); }
}

export class FakePaymentProvider implements PaymentProvider {
  readonly name = "FAKE" as const; private states = new Map<number, { status: ProviderStatus; amountVnd: number; id: string }>();
  async create(input: Parameters<PaymentProvider["create"]>[0]) { const id = `fake-${input.orderCode}`; this.states.set(input.orderCode, { status: "PENDING", amountVnd: input.amountVnd, id }); return { checkoutUrl: `/billing/return?order=${input.orderCode}`, providerPaymentId: id }; }
  async verifyWebhook(body: unknown) { const value = body as VerifiedPayment; if (!value || typeof value.orderCode !== "number" || typeof value.eventKey !== "string") throw new Error("INVALID_FAKE_WEBHOOK"); return value; }
  async getStatus(orderCode: number) { const value = this.states.get(orderCode); if (!value) throw new Error("ORDER_NOT_FOUND"); return { status: value.status, amountVnd: value.amountVnd, providerPaymentId: value.id }; }
  async cancel(orderCode: number): Promise<ProviderStatus> { const value = this.states.get(orderCode); if (value) value.status = "CANCELLED"; return "CANCELLED"; }
}

export function getPaymentProvider(): PaymentProvider {
  const selected = process.env.PAYMENT_PROVIDER ?? "PAYOS";
  if (selected === "FAKE") { if (process.env.NODE_ENV === "production") throw new Error("FAKE_PAYMENT_PROVIDER_FORBIDDEN"); return new FakePaymentProvider(); }
  if (selected !== "PAYOS") throw new Error("PAYMENTS_NOT_CONFIGURED");
  const clientId = process.env.PAYOS_CLIENT_ID, apiKey = process.env.PAYOS_API_KEY, checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) throw new Error("PAYMENTS_NOT_CONFIGURED");
  return new PayOSPaymentProvider({ clientId, apiKey, checksumKey });
}
