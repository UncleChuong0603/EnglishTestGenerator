import "server-only";

import { createHmac } from "node:crypto";
import { getServerEnv } from "@/lib/env";
import type { StoreProvider } from "./types";

function productIds(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getStoreBillingConfig() {
  const env = getServerEnv();
  const appleProducts = productIds(env.APPLE_IAP_PRODUCT_IDS);
  const googleProducts = productIds(env.GOOGLE_PLAY_PRODUCT_IDS);
  return {
    apple: {
      ready: Boolean(
        env.APPLE_BUNDLE_ID &&
        env.APPLE_APP_ID &&
        env.APPLE_ROOT_CA_B64 &&
        appleProducts.length,
      ),
      bundleId: env.APPLE_BUNDLE_ID,
      appAppleId: env.APPLE_APP_ID,
      rootCertificates: (env.APPLE_ROOT_CA_B64 ?? "")
        .split(";")
        .filter(Boolean)
        .map((value) => Buffer.from(value, "base64")),
      productIds: appleProducts,
    },
    google: {
      ready: Boolean(
        env.GOOGLE_PLAY_PACKAGE_NAME &&
        env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_B64 &&
        googleProducts.length,
      ),
      packageName: env.GOOGLE_PLAY_PACKAGE_NAME,
      serviceAccountJsonB64: env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_B64,
      productIds: googleProducts,
      rtdnAudience: env.GOOGLE_PLAY_RTDN_AUDIENCE,
      rtdnServiceAccountEmail: env.GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT_EMAIL,
    },
  };
}

export function referenceHash(provider: StoreProvider, reference: string) {
  return createHmac("sha256", getServerEnv().SESSION_SECRET)
    .update(`store-reference:v1:${provider}:${reference}`)
    .digest("hex");
}

export function googleAccountBinding(userId: string) {
  return createHmac("sha256", getServerEnv().SESSION_SECRET)
    .update(`google-play-account:v1:${userId}`)
    .digest("hex");
}
