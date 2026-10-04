import "server-only";

import { JWT, OAuth2Client } from "google-auth-library";
import { getStoreBillingConfig, googleAccountBinding } from "./config";
import {
  StoreVerificationError,
  type StoreEventType,
  type StorePurchaseStatus,
  type VerifiedStorePurchase,
} from "./types";

type GoogleSubscription = {
  startTime?: string;
  subscriptionState?: string;
  latestOrderId?: string;
  acknowledgementState?: string;
  testPurchase?: unknown;
  externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string };
  lineItems?: Array<{
    productId?: string;
    expiryTime?: string;
    latestSuccessfulOrderId?: string;
  }>;
};

export interface GooglePublisherClient {
  getSubscription(
    packageName: string,
    purchaseToken: string,
  ): Promise<GoogleSubscription>;
}

function normalizeState(
  state: string | undefined,
  expiresAt: Date,
): StorePurchaseStatus {
  if (expiresAt <= new Date()) return "EXPIRED";
  if (
    [
      "SUBSCRIPTION_STATE_ACTIVE",
      "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
      "SUBSCRIPTION_STATE_CANCELED",
    ].includes(state ?? "")
  )
    return "ACTIVE";
  return state === "SUBSCRIPTION_STATE_EXPIRED" ? "EXPIRED" : "REVOKED";
}

export class GooglePlayVerifier {
  constructor(
    private readonly client: GooglePublisherClient = createGooglePublisherClient(),
  ) {}

  async verifyPurchase(input: {
    purchaseToken: string;
    eventId?: string;
    eventType?: StoreEventType;
  }): Promise<VerifiedStorePurchase> {
    const config = getStoreBillingConfig().google;
    if (!config.ready || !config.packageName)
      throw new StoreVerificationError("STORE_NOT_CONFIGURED");
    let purchase: GoogleSubscription;
    try {
      purchase = await this.client.getSubscription(
        config.packageName,
        input.purchaseToken,
      );
    } catch {
      throw new StoreVerificationError("INVALID_STORE_PROOF");
    }
    const allowed = (purchase.lineItems ?? []).filter(
      (item) =>
        item.productId &&
        config.productIds.includes(item.productId) &&
        item.expiryTime,
    );
    const line = allowed.sort(
      (a, b) => Date.parse(b.expiryTime!) - Date.parse(a.expiryTime!),
    )[0];
    const start = purchase.startTime ? new Date(purchase.startTime) : null;
    const expiry = line?.expiryTime ? new Date(line.expiryTime) : null;
    const binding =
      purchase.externalAccountIdentifiers?.obfuscatedExternalAccountId;
    const transactionId =
      line?.latestSuccessfulOrderId ?? purchase.latestOrderId;
    if (
      !start ||
      !expiry ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(expiry.getTime()) ||
      expiry <= start ||
      !line?.productId ||
      !binding ||
      !transactionId
    )
      throw new StoreVerificationError("INVALID_STORE_PROOF");
    const status = normalizeState(purchase.subscriptionState, expiry);
    const eventType =
      input.eventType ??
      (status === "ACTIVE"
        ? "PURCHASE"
        : status === "EXPIRED"
          ? "EXPIRATION"
          : "REVOKE");
    return {
      provider: "GOOGLE_PLAY",
      providerEventId:
        input.eventId ?? `verify:${transactionId}:${expiry.toISOString()}`,
      eventType,
      userBinding: binding,
      providerReference: input.purchaseToken,
      originalTransactionId: purchase.latestOrderId ?? transactionId,
      transactionId,
      productId: line.productId,
      status,
      environment: purchase.testPurchase ? "SANDBOX" : "PRODUCTION",
      startsAt: start,
      expiresAt: expiry,
    };
  }
}

export function createGooglePublisherClient(): GooglePublisherClient {
  const config = getStoreBillingConfig().google;
  if (!config.ready || !config.serviceAccountJsonB64)
    throw new StoreVerificationError("STORE_NOT_CONFIGURED");
  let credentials: { client_email?: string; private_key?: string };
  try {
    credentials = JSON.parse(
      Buffer.from(config.serviceAccountJsonB64, "base64").toString("utf8"),
    );
  } catch {
    throw new StoreVerificationError("STORE_NOT_CONFIGURED");
  }
  if (!credentials.client_email || !credentials.private_key)
    throw new StoreVerificationError("STORE_NOT_CONFIGURED");
  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });
  return {
    async getSubscription(packageName, purchaseToken) {
      const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
      const response = await auth.request<GoogleSubscription>({
        url,
        method: "GET",
      });
      return response.data;
    },
  };
}

export async function verifyGooglePushIdentity(authorization: string | null) {
  const config = getStoreBillingConfig().google;
  if (!config.rtdnAudience || !config.rtdnServiceAccountEmail)
    throw new StoreVerificationError("STORE_NOT_CONFIGURED");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new StoreVerificationError("INVALID_STORE_PROOF");
  let ticket;
  try {
    ticket = await new OAuth2Client().verifyIdToken({
      idToken: token,
      audience: config.rtdnAudience,
    });
  } catch {
    throw new StoreVerificationError("INVALID_STORE_PROOF");
  }
  const payload = ticket.getPayload();
  if (
    !payload?.email_verified ||
    payload.email !== config.rtdnServiceAccountEmail
  )
    throw new StoreVerificationError("INVALID_STORE_PROOF");
}

export { googleAccountBinding };
