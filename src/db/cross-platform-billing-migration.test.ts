import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
const USER = "49000000-0000-4000-8000-000000000001";
const ORDER = "49000000-0000-4000-8000-000000000002";

beforeAll(async () => {
  const journal = JSON.parse(
    readFileSync("drizzle/meta/_journal.json", "utf8"),
  ) as { entries: Array<{ tag: string }> };
  for (const entry of journal.entries.slice(0, 53))
    await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
  await database.exec(`
    insert into users(id,email,email_normalized,status) values ('${USER}','billing49@example.com','billing49@example.com','active');
    insert into payment_orders(id,user_id,product_key,provider,order_code,amount,status,expires_at)
      values ('${ORDER}','${USER}','PREMIUM_30_DAYS','PAYOS',490001,99000,'PAID',now()+interval '1 day');
    insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at)
      values ('${USER}','PREMIUM','MANUAL',now()-interval '2 days',now()+interval '10 days');
    insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at,payment_order_id)
      values ('${USER}','PREMIUM','PAYMENT',now()-interval '1 day',now()+interval '30 days','${ORDER}');
  `);
  await database.exec(
    readFileSync("drizzle/0053_cross_platform_billing.sql", "utf8"),
  );
}, 30_000);

afterAll(async () => database.close());

describe("cross-platform billing migration", () => {
  it("preserves and relabels existing membership history", async () => {
    const result = await database.query<{ source: string }>(
      `select source from user_plan_memberships where user_id='${USER}' order by source`,
    );
    expect(result.rows.map((row) => row.source)).toEqual(["ADMIN", "PAYOS"]);
  });

  it("supports one platform-neutral Premium grant model", async () => {
    const purchase = crypto.randomUUID();
    await database.exec(`
      insert into store_purchases(id,user_id,provider,provider_reference_hash,original_transaction_id,latest_transaction_id,product_id,status,environment,starts_at,expires_at,last_verified_at)
      values ('${purchase}','${USER}','APPLE_IAP',repeat('a',64),'original-1','transaction-1','premium.monthly','ACTIVE','SANDBOX',now(),now()+interval '30 days',now());
      insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at,store_purchase_id,source_reference)
      values ('${USER}','PREMIUM','APPLE_IAP',now(),now()+interval '30 days','${purchase}','transaction-1');
    `);
    const active = await database.query<{ source: string }>(
      `select source from user_plan_memberships where user_id='${USER}' and revoked_at is null and starts_at<=now() and ends_at>now()`,
    );
    expect(active.rows.map((row) => row.source)).toEqual(
      expect.arrayContaining(["ADMIN", "PAYOS", "APPLE_IAP"]),
    );
    await expect(
      database.exec(
        `insert into user_plan_memberships(user_id,plan_key,source,starts_at) values ('${USER}','PREMIUM','APPLE_IAP',now())`,
      ),
    ).rejects.toThrow();
  });

  it("deduplicates provider events and rejects arbitrary sources", async () => {
    const [purchase] = (
      await database.query<{ id: string }>(
        `select id from store_purchases where user_id='${USER}' limit 1`,
      )
    ).rows;
    await database.exec(
      `insert into store_purchase_events(provider,provider_event_id,purchase_id,event_type) values ('APPLE_IAP','event-1','${purchase.id}','PURCHASE')`,
    );
    await expect(
      database.exec(
        `insert into store_purchase_events(provider,provider_event_id,purchase_id,event_type) values ('APPLE_IAP','event-1','${purchase.id}','RENEWAL')`,
      ),
    ).rejects.toThrow();
    await expect(
      database.exec(
        `insert into user_plan_memberships(user_id,plan_key,source,starts_at) values ('${USER}','PREMIUM','CLIENT',now())`,
      ),
    ).rejects.toThrow();
  });
});
