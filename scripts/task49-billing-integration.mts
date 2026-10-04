import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";
import { assertTestDatabase } from "./lib/assert-test-database.mjs";

const testUrl =
  process.env.TASK49_TEST_DATABASE_URL ?? process.env.TASK17_TEST_DATABASE_URL;
if (!testUrl) throw new Error("TASK49_TEST_DATABASE_URL_REQUIRED");
await assertTestDatabase(testUrl);
process.env.DATABASE_URL = testUrl;
process.env.SESSION_SECRET =
  "task49-isolated-integration-secret-with-at-least-32-characters";
process.env.APP_URL = "http://localhost:3000";
process.env.APPLE_BUNDLE_ID = "net.toeicgym.app";
process.env.APPLE_APP_ID = "123456789";
process.env.APPLE_ROOT_CA_B64 = Buffer.from("test-root").toString("base64");
process.env.APPLE_IAP_PRODUCT_IDS = "premium.monthly";
process.env.GOOGLE_PLAY_PACKAGE_NAME = "net.toeicgym.app";
process.env.GOOGLE_PLAY_PRODUCT_IDS = "premium.monthly";
process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_B64 = Buffer.from(
  JSON.stringify({
    client_email: "billing@example.invalid",
    private_key: "test",
  }),
).toString("base64");

const pool = new pg.Pool({ connectionString: testUrl, max: 8 });

async function freshMigrate() {
  await pool.query("drop schema public cascade");
  await pool.query("create schema public");
  const journal = JSON.parse(
    readFileSync("drizzle/meta/_journal.json", "utf8"),
  );
  for (const entry of journal.entries) {
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
  return journal.entries.at(-1).tag as string;
}

async function createUser(label: string) {
  const id = randomUUID();
  const email = `${label}@task49.invalid`;
  await pool.query(
    "insert into users(id,email,email_normalized,status,email_verified_at) values($1,$2,$2,'active',now())",
    [id, email],
  );
  await pool.query("insert into profiles(id,full_name) values($1,$2)", [
    id,
    label,
  ]);
  return id;
}

async function main() {
  const latestMigration = await freshMigrate();
  const postgresVersion = (await pool.query("show server_version")).rows[0]
    .server_version as string;
  assert.match(postgresVersion, /^17\./);

  const [
    { applyVerifiedStorePurchase },
    { getEffectivePlan, getMembershipState },
    { googleAccountBinding },
  ] = await Promise.all([
    import("../src/lib/store-billing/service.ts"),
    import("../src/lib/entitlements/service.ts"),
    import("../src/lib/store-billing/config.ts"),
  ]);

  const userId = await createUser("alice");
  await pool.query(
    "insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM','TRIAL',now()-interval '1 day',now()+interval '2 day')",
    [userId],
  );
  const base = {
    provider: "APPLE_IAP" as const,
    providerEventId: "apple-purchase-1",
    eventType: "PURCHASE" as const,
    userBinding: userId,
    providerReference: "apple-original-1",
    originalTransactionId: "apple-original-1",
    transactionId: "apple-transaction-1",
    productId: "premium.monthly",
    status: "ACTIVE" as const,
    environment: "SANDBOX" as const,
    startsAt: new Date("2026-10-01T00:00:00.000Z"),
    expiresAt: new Date("2030-11-01T00:00:00.000Z"),
  };

  const purchaseResult = await applyVerifiedStorePurchase(userId, base);
  assert.equal(purchaseResult.duplicate, false);
  assert.equal(purchaseResult.status, "ACTIVE");
  assert.match(purchaseResult.purchaseId, /^[0-9a-f-]{36}$/i);
  assert.equal(await getEffectivePlan(userId), "PREMIUM");
  let memberships = await pool.query(
    "select source, source_reference, revoked_at from user_plan_memberships where user_id=$1 order by created_at",
    [userId],
  );
  assert.deepEqual(
    memberships.rows.map((row) => row.source),
    ["TRIAL", "APPLE_IAP"],
  );
  assert.equal(
    Number(
      (
        await pool.query(
          "select count(*) from product_events where user_id=$1 and event_name='trial_to_paid'",
          [userId],
        )
      ).rows[0].count,
    ),
    1,
  );

  const duplicate = await applyVerifiedStorePurchase(userId, base);
  assert.equal(duplicate.duplicate, true);
  assert.equal(
    Number(
      (
        await pool.query(
          "select count(*) from store_purchase_events where provider_event_id='apple-purchase-1'",
        )
      ).rows[0].count,
    ),
    1,
  );

  await applyVerifiedStorePurchase(userId, {
    ...base,
    providerEventId: "apple-restore-1",
    eventType: "RESTORE",
  });
  assert.equal(
    Number(
      (
        await pool.query(
          "select count(*) from user_plan_memberships where user_id=$1 and source='APPLE_IAP'",
          [userId],
        )
      ).rows[0].count,
    ),
    1,
  );

  const renewed = {
    ...base,
    providerEventId: "apple-renewal-1",
    eventType: "RENEWAL" as const,
    transactionId: "apple-transaction-2",
    startsAt: new Date("2030-11-01T00:00:00.000Z"),
    expiresAt: new Date("2030-12-01T00:00:00.000Z"),
  };
  await applyVerifiedStorePurchase(userId, renewed);
  assert.equal(
    (
      await pool.query(
        "select latest_transaction_id from store_purchases where user_id=$1",
        [userId],
      )
    ).rows[0].latest_transaction_id,
    "apple-transaction-2",
  );

  await applyVerifiedStorePurchase(userId, {
    ...base,
    providerEventId: "apple-stale-expiry",
    eventType: "EXPIRATION",
    status: "EXPIRED",
  });
  assert.equal(
    (
      await pool.query("select status from store_purchases where user_id=$1", [
        userId,
      ])
    ).rows[0].status,
    "ACTIVE",
  );

  await applyVerifiedStorePurchase(userId, {
    ...renewed,
    providerEventId: "apple-refund-1",
    eventType: "REFUND",
    status: "REFUNDED",
  });
  memberships = await pool.query(
    "select revoked_at from user_plan_memberships where user_id=$1 and source='APPLE_IAP'",
    [userId],
  );
  assert.ok(memberships.rows.every((row) => row.revoked_at));
  await pool.query(
    "update user_plan_memberships set revoked_at=now() where user_id=$1 and source='TRIAL'",
    [userId],
  );
  assert.equal((await getMembershipState(userId)).status, "REVOKED");

  const otherUserId = await createUser("bob");
  await assert.rejects(
    applyVerifiedStorePurchase(otherUserId, base),
    /ACCOUNT_MISMATCH/,
  );
  await assert.rejects(
    applyVerifiedStorePurchase(otherUserId, {
      ...base,
      userBinding: otherUserId,
      providerEventId: "apple-owner-attack",
    }),
    /ACCOUNT_MISMATCH/,
  );

  const googleUserId = await createUser("google");
  const rawPurchaseToken = "raw-google-purchase-token";
  await applyVerifiedStorePurchase(googleUserId, {
    provider: "GOOGLE_PLAY",
    providerEventId: "google-purchase-1",
    eventType: "PURCHASE",
    userBinding: googleAccountBinding(googleUserId),
    providerReference: rawPurchaseToken,
    originalTransactionId: "GPA.1234",
    transactionId: "GPA.1234..0",
    productId: "premium.monthly",
    status: "ACTIVE",
    environment: "SANDBOX",
    startsAt: new Date("2026-10-01T00:00:00.000Z"),
    expiresAt: new Date("2030-11-01T00:00:00.000Z"),
  });
  const storedGoogle = (
    await pool.query(
      "select provider_reference_hash from store_purchases where user_id=$1",
      [googleUserId],
    )
  ).rows[0];
  assert.notEqual(storedGoogle.provider_reference_hash, rawPurchaseToken);
  assert.equal(storedGoogle.provider_reference_hash.length, 64);
  assert.equal(await getEffectivePlan(googleUserId), "PREMIUM");

  console.log("TASK49_CROSS_PLATFORM_BILLING_INTEGRATION_PASS");
  console.log(
    JSON.stringify({
      postgres: postgresVersion.split(".")[0],
      latestMigration,
      purchase: true,
      restore: true,
      renewal: true,
      expirationOrdering: true,
      refundAndRevoke: true,
      duplicateNotification: true,
      accountOwnership: true,
      trialToPaid: true,
      rawProofStored: false,
      googlePlay: true,
    }),
  );
}

try {
  await main();
} finally {
  await pool.end();
  const { pool: appPool } = await import("../src/db/index.ts");
  await appPool.end();
}
