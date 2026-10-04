import "server-only";

import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  productEvents,
  storePurchaseEvents,
  storePurchases,
  userPlanMemberships,
  users,
} from "@/db/schema";
import { getMembershipState } from "@/lib/entitlements/service";
import { AppleStoreVerifier } from "./apple";
import {
  getStoreBillingConfig,
  googleAccountBinding,
  referenceHash,
} from "./config";
import { GooglePlayVerifier } from "./google";
import {
  StoreVerificationError,
  type StoreEventType,
  type VerifiedStorePurchase,
} from "./types";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function expectedBinding(
  userId: string,
  provider: VerifiedStorePurchase["provider"],
) {
  return provider === "APPLE_IAP"
    ? userId.toLowerCase()
    : googleAccountBinding(userId);
}

export async function applyVerifiedStorePurchase(
  userId: string,
  verified: VerifiedStorePurchase,
) {
  if (verified.userBinding !== expectedBinding(userId, verified.provider))
    throw new StoreVerificationError("ACCOUNT_MISMATCH");
  const providerReferenceHash = referenceHash(
    verified.provider,
    verified.providerReference,
  );
  return db.transaction(async (tx: Tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`${verified.provider}:${providerReferenceHash}`}, 0))`,
    );
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:plan`}, 0))`,
    );
    const [account] = await tx
      .select({ id: users.id, deletedAt: users.deletedAt })
      .from(users)
      .where(eq(users.id, userId))
      .for("key share")
      .limit(1);
    if (!account || account.deletedAt)
      throw new StoreVerificationError("ACCOUNT_MISMATCH");
    const [owned] = await tx
      .select()
      .from(storePurchases)
      .where(
        and(
          eq(storePurchases.provider, verified.provider),
          eq(storePurchases.providerReferenceHash, providerReferenceHash),
        ),
      )
      .for("update")
      .limit(1);
    if (owned && owned.userId !== userId)
      throw new StoreVerificationError("ACCOUNT_MISMATCH");
    const now = new Date();
    const revokedAt = ["REFUNDED", "REVOKED"].includes(verified.status)
      ? now
      : null;
    let purchase = owned;
    if (!purchase) {
      [purchase] = await tx
        .insert(storePurchases)
        .values({
          userId,
          provider: verified.provider,
          providerReferenceHash,
          originalTransactionId: verified.originalTransactionId,
          latestTransactionId: verified.transactionId,
          productId: verified.productId,
          status: verified.status,
          environment: verified.environment,
          startsAt: verified.startsAt,
          expiresAt: verified.expiresAt,
          revokedAt,
          lastVerifiedAt: now,
        })
        .returning();
    }
    const inserted = await tx
      .insert(storePurchaseEvents)
      .values({
        provider: verified.provider,
        providerEventId: verified.providerEventId,
        purchaseId: purchase.id,
        eventType: verified.eventType,
        metadata: {
          productId: verified.productId,
          environment: verified.environment,
        },
      })
      .onConflictDoNothing()
      .returning({ id: storePurchaseEvents.id });
    if (!inserted.length)
      return {
        duplicate: true,
        status: purchase.status,
        purchaseId: purchase.id,
      };
    const shouldAdvancePurchase =
      !owned ||
      verified.status === "REFUNDED" ||
      verified.status === "REVOKED" ||
      verified.expiresAt >= owned.expiresAt;
    if (owned && shouldAdvancePurchase) {
      [purchase] = await tx
        .update(storePurchases)
        .set({
          latestTransactionId: verified.transactionId,
          productId: verified.productId,
          status: verified.status,
          environment: verified.environment,
          startsAt: verified.startsAt,
          expiresAt: verified.expiresAt,
          revokedAt,
          lastVerifiedAt: now,
          updatedAt: now,
        })
        .where(eq(storePurchases.id, owned.id))
        .returning();
    }

    if (verified.status === "ACTIVE") {
      await tx
        .insert(userPlanMemberships)
        .values({
          userId,
          planKey: "PREMIUM",
          source: verified.provider,
          storePurchaseId: purchase.id,
          sourceReference: verified.transactionId,
          startsAt: verified.startsAt,
          endsAt: verified.expiresAt,
        })
        .onConflictDoNothing();
      const [trial] = await tx
        .select({ id: userPlanMemberships.id })
        .from(userPlanMemberships)
        .where(
          and(
            eq(userPlanMemberships.userId, userId),
            eq(userPlanMemberships.source, "TRIAL"),
          ),
        )
        .limit(1);
      if (trial)
        await tx
          .insert(productEvents)
          .values({
            userId,
            eventName: "trial_to_paid",
            source: "payment",
            deduplicationKey: `trial-to-paid:${userId}`,
            properties: { provider: verified.provider },
          })
          .onConflictDoNothing();
    } else if (
      verified.status === "REFUNDED" ||
      verified.status === "REVOKED"
    ) {
      await tx
        .update(userPlanMemberships)
        .set({ revokedAt: now, updatedAt: now })
        .where(
          and(
            eq(userPlanMemberships.storePurchaseId, purchase.id),
            isNull(userPlanMemberships.revokedAt),
          ),
        );
    }
    await tx
      .update(storePurchaseEvents)
      .set({ processingStatus: "PROCESSED", processedAt: now })
      .where(eq(storePurchaseEvents.id, inserted[0].id));
    return {
      duplicate: false,
      status: verified.status,
      purchaseId: purchase.id,
    };
  });
}

export async function verifyStorePurchase(
  userId: string,
  input:
    | {
        platform: "ios";
        signedTransaction: string;
        mode: "PURCHASE" | "RESTORE";
      }
    | {
        platform: "android";
        purchaseToken: string;
        mode: "PURCHASE" | "RESTORE";
      },
  adapters?: { apple?: AppleStoreVerifier; google?: GooglePlayVerifier },
) {
  const verified =
    input.platform === "ios"
      ? await (adapters?.apple ?? new AppleStoreVerifier()).verifyPurchase(
          input.signedTransaction,
          input.mode,
        )
      : await (adapters?.google ?? new GooglePlayVerifier()).verifyPurchase({
          purchaseToken: input.purchaseToken,
          eventType: input.mode,
        });
  await applyVerifiedStorePurchase(userId, verified);
  return getMembershipState(userId);
}

export async function processAppleNotification(
  signedPayload: string,
  adapter = new AppleStoreVerifier(),
) {
  const verified = await adapter.verifyNotification(signedPayload);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      verified.userBinding,
    )
  )
    throw new StoreVerificationError("ACCOUNT_MISMATCH");
  return applyVerifiedStorePurchase(verified.userBinding, verified);
}

function googleEventType(notificationType: number): StoreEventType {
  if (notificationType === 2) return "RENEWAL";
  if (notificationType === 12) return "REVOKE";
  if (notificationType === 13) return "EXPIRATION";
  return "PURCHASE";
}

export async function processGoogleNotification(
  input: {
    messageId: string;
    packageName: string;
    purchaseToken: string;
    notificationType: number;
  },
  adapter = new GooglePlayVerifier(),
) {
  const config = getStoreBillingConfig().google;
  if (!config.ready || input.packageName !== config.packageName)
    throw new StoreVerificationError("INVALID_STORE_PROOF");
  const hash = referenceHash("GOOGLE_PLAY", input.purchaseToken);
  const [purchase] = await db
    .select({ userId: storePurchases.userId })
    .from(storePurchases)
    .where(
      and(
        eq(storePurchases.provider, "GOOGLE_PLAY"),
        eq(storePurchases.providerReferenceHash, hash),
      ),
    )
    .limit(1);
  if (!purchase) throw new StoreVerificationError("ACCOUNT_MISMATCH");
  const verified = await adapter.verifyPurchase({
    purchaseToken: input.purchaseToken,
    eventId: input.messageId,
    eventType: googleEventType(input.notificationType),
  });
  return applyVerifiedStorePurchase(purchase.userId, verified);
}

export function storeBillingClientConfig(userId: string) {
  const config = getStoreBillingConfig();
  return {
    apple: {
      available: config.apple.ready,
      productIds: config.apple.productIds,
      appAccountToken: userId,
    },
    google: {
      available: config.google.ready,
      productIds: config.google.productIds,
      obfuscatedAccountId: googleAccountBinding(userId),
    },
  };
}
