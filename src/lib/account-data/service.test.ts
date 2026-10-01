import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite();
  return { db: drizzle(client), pool: client };
});

import { pool } from "@/db";
import { AccountDataError, deleteAccount, exportLearningData } from "./service";

const database = pool as unknown as PGlite;
const USER_A = "10000000-0000-4000-8000-000000000001";
const USER_B = "10000000-0000-4000-8000-000000000002";
const USER_ADMIN = "10000000-0000-4000-8000-000000000003";

beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: Array<{ tag: string }> };
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
  await database.exec(`
    insert into users (id,email,email_normalized,status,email_verified_at) values
      ('${USER_A}','owner@example.com','owner@example.com','active',now()),
      ('${USER_B}','other@example.com','other@example.com','active',now()),
      ('${USER_ADMIN}','admin@example.com','admin@example.com','active',now());
    insert into profiles (id,full_name) values
      ('${USER_A}','Owner'),
      ('${USER_B}','Other'),
      ('${USER_ADMIN}','Admin');
    insert into learner_goals (user_id,target_score) values
      ('${USER_A}',750),
      ('${USER_B}',900);
    insert into user_sessions (user_id,session_token_hash,expires_at) values
      ('${USER_A}','session-a',now() + interval '30 days'),
      ('${USER_B}','session-b',now() + interval '30 days');
    insert into lifecycle_emails (user_id,type,window_key,status) values
      ('${USER_A}','nudge','window-a','sent');
    insert into product_events (event_name,user_id,source,route,properties) values
      ('practice_started','${USER_A}','server','/practice','{"email":"owner@example.com"}'::jsonb);
    insert into security_events (user_id,event_type,metadata) values
      ('${USER_A}','login_success','{"ip":"private"}'::jsonb);
    insert into payment_orders (user_id,product_key,provider,order_code,provider_payment_id,amount,status,checkout_url,expires_at) values
      ('${USER_A}','PREMIUM_30_DAYS','FAKE',420001,'provider-private',99000,'PAID','https://checkout.invalid/private',now() + interval '1 day');
    insert into user_plan_memberships (user_id,plan_key,source,starts_at,ends_at,payment_order_id)
      select '${USER_A}','PREMIUM','PAYMENT',now(),now() + interval '30 days',id from payment_orders where user_id='${USER_A}';
    insert into user_roles (user_id,role) values ('${USER_ADMIN}','ADMIN');
  `);
}, 60_000);

afterAll(async () => database.close());

describe("account data ownership and deletion", () => {
  it("exports only the authenticated owner's allowlisted data", async () => {
    const exported = await exportLearningData(USER_A, new Date("2026-10-01T00:00:00.000Z"));
    expect(exported.account.id).toBe(USER_A);
    expect(exported.learningGoal?.targetScore).toBe(750);
    const serialized = JSON.stringify(exported);
    expect(serialized).not.toContain(USER_B);
    expect(serialized).not.toContain("other@example.com");
    expect(serialized).not.toContain("session-a");
    expect(serialized).not.toContain("provider-private");
    expect(serialized).not.toContain("https://checkout.invalid/private");
  });

  it("refuses mismatched confirmation and active-administrator deletion", async () => {
    await expect(deleteAccount(USER_B, "owner@example.com")).rejects.toMatchObject({ code: "CONFIRMATION_MISMATCH" } satisfies Partial<AccountDataError>);
    await expect(deleteAccount(USER_ADMIN, "admin@example.com")).rejects.toMatchObject({ code: "ADMIN_HANDOFF_REQUIRED" } satisfies Partial<AccountDataError>);
    const result = await database.query<{ status: string }>(`select status from users where id='${USER_B}'`);
    expect(result.rows[0]?.status).toBe("active");
  });

  it("atomically invalidates sessions, erases learning data and anonymizes retained records", async () => {
    const first = await deleteAccount(USER_A, "OWNER@example.com", new Date("2026-10-01T10:00:00.000Z"));
    expect(first.status).toBe("deleted");
    expect((await database.query(`select 1 from user_sessions where user_id='${USER_A}'`)).rows).toHaveLength(0);
    expect((await database.query(`select 1 from profiles where id='${USER_A}'`)).rows).toHaveLength(0);
    expect((await database.query(`select 1 from learner_goals where user_id='${USER_A}'`)).rows).toHaveLength(0);
    expect((await database.query(`select 1 from lifecycle_emails where user_id='${USER_A}'`)).rows).toHaveLength(0);

    const user = await database.query<{ email: string; status: string; deleted_at: Date }>(`select email,status,deleted_at from users where id='${USER_A}'`);
    expect(user.rows[0]).toMatchObject({ email: `deleted+${USER_A}@deleted.invalid`, status: "disabled" });
    expect(user.rows[0]?.deleted_at).toBeTruthy();

    const payment = await database.query<{ checkout_url: string | null }>(`select checkout_url from payment_orders where user_id='${USER_A}'`);
    expect(payment.rows).toHaveLength(1);
    expect(payment.rows[0]?.checkout_url).toBeNull();
    const membership = await database.query<{ revoked_at: Date | null }>(`select revoked_at from user_plan_memberships where user_id='${USER_A}'`);
    expect(membership.rows[0]?.revoked_at).toBeTruthy();
    const event = await database.query<{ user_id: string | null; route: string | null; properties: Record<string, unknown> }>("select user_id,route,properties from product_events");
    expect(event.rows[0]).toEqual({ user_id: null, route: null, properties: {} });
    const security = await database.query<{ user_id: string | null; metadata: Record<string, unknown> }>("select user_id,metadata from security_events");
    expect(security.rows[0]).toEqual({ user_id: null, metadata: {} });
  });

  it("treats a deletion retry as a successful no-op", async () => {
    const retried = await deleteAccount(USER_A, "owner@example.com", new Date("2026-10-01T11:00:00.000Z"));
    expect(retried.status).toBe("already_deleted");
    expect(retried.deletedAt.toISOString()).toBe("2026-10-01T10:00:00.000Z");
  });
});
