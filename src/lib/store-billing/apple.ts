import "server-only";

import {
  Environment,
  SignedDataVerifier,
  type JWSTransactionDecodedPayload,
  type ResponseBodyV2DecodedPayload,
} from "@apple/app-store-server-library";
import { getStoreBillingConfig } from "./config";
import {
  StoreVerificationError,
  type StoreEventType,
  type VerifiedStorePurchase,
} from "./types";

export interface AppleSignedDataClient {
  verifyTransaction(
    signedTransaction: string,
  ): Promise<JWSTransactionDecodedPayload>;
  verifyNotification(
    signedPayload: string,
  ): Promise<{
    notification: ResponseBodyV2DecodedPayload;
    transaction: JWSTransactionDecodedPayload;
  }>;
}

function requireFields(transaction: JWSTransactionDecodedPayload) {
  const {
    appAccountToken,
    originalTransactionId,
    transactionId,
    productId,
    purchaseDate,
    expiresDate,
  } = transaction;
  if (
    !appAccountToken ||
    !originalTransactionId ||
    !transactionId ||
    !productId ||
    !purchaseDate ||
    !expiresDate ||
    expiresDate <= purchaseDate
  )
    throw new StoreVerificationError("INVALID_STORE_PROOF");
  return {
    appAccountToken,
    originalTransactionId,
    transactionId,
    productId,
    purchaseDate,
    expiresDate,
  };
}

function normalize(
  transaction: JWSTransactionDecodedPayload,
  eventType: StoreEventType,
  providerEventId: string,
): VerifiedStorePurchase {
  const fields = requireFields(transaction);
  const config = getStoreBillingConfig().apple;
  if (!config.productIds.includes(fields.productId))
    throw new StoreVerificationError("PRODUCT_NOT_ALLOWED");
  const revoked = Boolean(transaction.revocationDate);
  const expired = fields.expiresDate <= Date.now();
  return {
    provider: "APPLE_IAP",
    providerEventId,
    eventType: revoked
      ? eventType === "REFUND"
        ? "REFUND"
        : "REVOKE"
      : eventType,
    userBinding: fields.appAccountToken.toLowerCase(),
    providerReference: fields.originalTransactionId,
    originalTransactionId: fields.originalTransactionId,
    transactionId: fields.transactionId,
    productId: fields.productId,
    status: revoked
      ? eventType === "REFUND"
        ? "REFUNDED"
        : "REVOKED"
      : expired
        ? "EXPIRED"
        : "ACTIVE",
    environment:
      String(transaction.environment).toLowerCase() === "production"
        ? "PRODUCTION"
        : "SANDBOX",
    startsAt: new Date(fields.purchaseDate),
    expiresAt: new Date(fields.expiresDate),
  };
}

export class AppleStoreVerifier {
  constructor(
    private readonly client: AppleSignedDataClient = createAppleSignedDataClient(),
  ) {}

  async verifyPurchase(
    signedTransaction: string,
    mode: "PURCHASE" | "RESTORE",
  ) {
    const transaction = await this.client.verifyTransaction(signedTransaction);
    return normalize(
      transaction,
      mode,
      `${mode.toLowerCase()}:${transaction.transactionId ?? "invalid"}`,
    );
  }

  async verifyNotification(signedPayload: string) {
    const { notification, transaction } =
      await this.client.verifyNotification(signedPayload);
    const type = String(notification.notificationType ?? "");
    const eventType: StoreEventType =
      type === "REFUND"
        ? "REFUND"
        : type === "REVOKE"
          ? "REVOKE"
          : type === "EXPIRED"
            ? "EXPIRATION"
            : type === "DID_RENEW"
              ? "RENEWAL"
              : "PURCHASE";
    return normalize(
      transaction,
      eventType,
      notification.notificationUUID ??
        `notification:${transaction.transactionId ?? "invalid"}`,
    );
  }
}

export function createAppleSignedDataClient(): AppleSignedDataClient {
  const config = getStoreBillingConfig().apple;
  if (!config.ready || !config.bundleId || !config.appAppleId)
    throw new StoreVerificationError("STORE_NOT_CONFIGURED");
  const production = new SignedDataVerifier(
    config.rootCertificates,
    true,
    Environment.PRODUCTION,
    config.bundleId,
    config.appAppleId,
  );
  const sandbox = new SignedDataVerifier(
    config.rootCertificates,
    true,
    Environment.SANDBOX,
    config.bundleId,
  );
  async function inEither<T>(
    operation: (verifier: SignedDataVerifier) => Promise<T>,
  ) {
    try {
      return await operation(production);
    } catch {
      try {
        return await operation(sandbox);
      } catch {
        throw new StoreVerificationError("INVALID_STORE_PROOF");
      }
    }
  }
  return {
    verifyTransaction: (signed) =>
      inEither((verifier) => verifier.verifyAndDecodeTransaction(signed)),
    verifyNotification: (signed) =>
      inEither(async (verifier) => {
        const notification = await verifier.verifyAndDecodeNotification(signed);
        if (!notification.data?.signedTransactionInfo)
          throw new StoreVerificationError("INVALID_STORE_PROOF");
        const transaction = await verifier.verifyAndDecodeTransaction(
          notification.data.signedTransactionInfo,
        );
        return { notification, transaction };
      }),
  };
}
