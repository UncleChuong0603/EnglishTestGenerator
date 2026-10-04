export type StoreProvider = "APPLE_IAP" | "GOOGLE_PLAY";
export type StorePurchaseStatus = "ACTIVE" | "EXPIRED" | "REFUNDED" | "REVOKED";
export type StoreEventType =
  "PURCHASE" | "RESTORE" | "RENEWAL" | "EXPIRATION" | "REFUND" | "REVOKE";

export type VerifiedStorePurchase = {
  provider: StoreProvider;
  providerEventId: string;
  eventType: StoreEventType;
  userBinding: string;
  providerReference: string;
  originalTransactionId: string;
  transactionId: string;
  productId: string;
  status: StorePurchaseStatus;
  environment: "PRODUCTION" | "SANDBOX";
  startsAt: Date;
  expiresAt: Date;
};

export class StoreVerificationError extends Error {
  constructor(
    readonly code:
      | "STORE_NOT_CONFIGURED"
      | "INVALID_STORE_PROOF"
      | "PRODUCT_NOT_ALLOWED"
      | "ACCOUNT_MISMATCH",
  ) {
    super(code);
    this.name = "StoreVerificationError";
  }
}
