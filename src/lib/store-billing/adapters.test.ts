import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

import { AppleStoreVerifier, type AppleSignedDataClient } from "./apple";
import {
  googleAccountBinding,
  GooglePlayVerifier,
  type GooglePublisherClient,
} from "./google";

const USER = "49000000-0000-4000-8000-000000000001";
function commonEnv() {
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@db:5432/test");
  vi.stubEnv(
    "SESSION_SECRET",
    "task49-test-secret-with-at-least-32-characters",
  );
  vi.stubEnv("APP_URL", "http://localhost:3000");
  vi.stubEnv("APPLE_BUNDLE_ID", "net.toeicgym.app");
  vi.stubEnv("APPLE_APP_ID", "123456789");
  vi.stubEnv("APPLE_ROOT_CA_B64", Buffer.from("root").toString("base64"));
  vi.stubEnv("APPLE_IAP_PRODUCT_IDS", "premium.monthly");
  vi.stubEnv("GOOGLE_PLAY_PACKAGE_NAME", "net.toeicgym.app");
  vi.stubEnv("GOOGLE_PLAY_PRODUCT_IDS", "premium.monthly");
  vi.stubEnv(
    "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_B64",
    Buffer.from(
      JSON.stringify({
        client_email: "billing@example.com",
        private_key: "key",
      }),
    ).toString("base64"),
  );
}
beforeEach(commonEnv);
afterEach(() => vi.unstubAllEnvs());

describe("Apple IAP adapter", () => {
  const transaction = {
    appAccountToken: USER,
    originalTransactionId: "original-1",
    transactionId: "transaction-1",
    productId: "premium.monthly",
    purchaseDate: Date.parse("2026-10-01T00:00:00Z"),
    expiresDate: Date.parse("2030-11-01T00:00:00Z"),
    environment: "Sandbox",
  };
  it("accepts only server-verified signed transaction fields", async () => {
    const client: AppleSignedDataClient = {
      verifyTransaction: vi.fn().mockResolvedValue(transaction),
      verifyNotification: vi.fn(),
    };
    const result = await new AppleStoreVerifier(client).verifyPurchase(
      "signed-jws",
      "RESTORE",
    );
    expect(result).toMatchObject({
      provider: "APPLE_IAP",
      eventType: "RESTORE",
      userBinding: USER,
      productId: "premium.monthly",
      status: "ACTIVE",
      environment: "SANDBOX",
    });
    expect(client.verifyTransaction).toHaveBeenCalledWith("signed-jws");
  });
  it("maps verified refund notification to revocation", async () => {
    const client: AppleSignedDataClient = {
      verifyTransaction: vi.fn(),
      verifyNotification: vi
        .fn()
        .mockResolvedValue({
          notification: {
            notificationType: "REFUND",
            notificationUUID: "notification-1",
          },
          transaction: { ...transaction, revocationDate: Date.now() },
        }),
    };
    expect(
      await new AppleStoreVerifier(client).verifyNotification("signed-payload"),
    ).toMatchObject({
      providerEventId: "notification-1",
      eventType: "REFUND",
      status: "REFUNDED",
    });
  });
});

describe("Google Play adapter", () => {
  it("queries subscriptionsv2 and binds the purchase to the server account token", async () => {
    const response = {
      startTime: "2026-10-01T00:00:00Z",
      subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
      latestOrderId: "GPA.1",
      externalAccountIdentifiers: {
        obfuscatedExternalAccountId: googleAccountBinding(USER),
      },
      lineItems: [
        {
          productId: "premium.monthly",
          expiryTime: "2030-11-01T00:00:00Z",
          latestSuccessfulOrderId: "GPA.1..0",
        },
      ],
    };
    const client: GooglePublisherClient = {
      getSubscription: vi.fn().mockResolvedValue(response),
    };
    const result = await new GooglePlayVerifier(client).verifyPurchase({
      purchaseToken: "server-token-from-google",
      eventType: "RESTORE",
    });
    expect(result).toMatchObject({
      provider: "GOOGLE_PLAY",
      eventType: "RESTORE",
      productId: "premium.monthly",
      transactionId: "GPA.1..0",
      status: "ACTIVE",
      environment: "PRODUCTION",
    });
    expect(client.getSubscription).toHaveBeenCalledWith(
      "net.toeicgym.app",
      "server-token-from-google",
    );
  });
  it("does not turn expired server state into Premium", async () => {
    const client: GooglePublisherClient = {
      getSubscription: vi
        .fn()
        .mockResolvedValue({
          startTime: "2025-01-01T00:00:00Z",
          subscriptionState: "SUBSCRIPTION_STATE_EXPIRED",
          latestOrderId: "GPA.2",
          externalAccountIdentifiers: {
            obfuscatedExternalAccountId: googleAccountBinding(USER),
          },
          lineItems: [
            {
              productId: "premium.monthly",
              expiryTime: "2025-02-01T00:00:00Z",
            },
          ],
        }),
    };
    expect(
      await new GooglePlayVerifier(client).verifyPurchase({
        purchaseToken: "expired-server-token",
      }),
    ).toMatchObject({ status: "EXPIRED", eventType: "EXPIRATION" });
  });
});
