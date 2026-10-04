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
import { getSessionByToken, issueSessionToken } from "@/lib/auth/session-core";
import { applyVerifiedPayment, createPaymentOrder } from "@/lib/payments/service";
import { FakePaymentProvider } from "@/lib/payments/provider";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/env", () => ({ getServerEnv: () => ({ SESSION_SECRET: "task42-unit-session-secret-not-production" }) }));

const database = pool as unknown as PGlite;
const USER_A = "10000000-0000-4000-8000-000000000001";
const USER_B = "10000000-0000-4000-8000-000000000002";
const USER_ADMIN = "10000000-0000-4000-8000-000000000003";
const QUESTION_A = "10000000-0000-4000-8000-000000000004";
const MOCK_A = "10000000-0000-4000-8000-000000000005";
const SECTION_A = "10000000-0000-4000-8000-000000000006";

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
      select '${USER_A}','PREMIUM','PAYOS',now(),now() + interval '30 days',id from payment_orders where user_id='${USER_A}';
    insert into user_roles (user_id,role) values ('${USER_ADMIN}','ADMIN');
    insert into questions(id,toeic_part,skill,sub_skill,question_type,question_text,difficulty)
      values ('${QUESTION_A}',5,'grammar','verb_tense','part5','Unit question','medium');
    insert into full_mock_runs(id,user_id,mode,status,listening_started_at,listening_deadline,reading_started_at,reading_deadline)
      values ('${MOCK_A}','${USER_A}','FULL','READING',now()-interval '1 hour',now(),now(),now()+interval '75 minutes');
    insert into practice_sessions(id,user_id,part,question_count,source,full_mock_run_id,full_mock_order,status,score_correct,score_total,submitted_at,submission_reason)
      values ('${SECTION_A}','${USER_A}',5,1,'full_mock','${MOCK_A}',5,'submitted',1,1,now(),'mock_section_complete');
    insert into practice_session_questions(session_id,question_id,display_order,mastery_target_question_id)
      values ('${SECTION_A}','${QUESTION_A}',1,'${QUESTION_A}');
    insert into attempt_answers(session_id,user_id,question_id,is_correct)
      values ('${SECTION_A}','${USER_A}','${QUESTION_A}',true);
    insert into payment_orders (user_id,product_key,provider,order_code,provider_payment_id,amount,status,expires_at)
      values ('${USER_A}','PREMIUM_30_DAYS','FAKE',420002,'late-provider',99000,'PENDING',now() + interval '1 day');
  `);
}, 60_000);

afterAll(async () => { await database.close(); vi.unstubAllEnvs(); });

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
    expect(exported.learning.practiceSessions.find(row => row.id === SECTION_A)?.scoreCorrect).toBeNull();
    expect(exported.learning.answers.find(row => row.sessionId === SECTION_A)?.isCorrect).toBeNull();
  });

  it("refuses mismatched confirmation and active-administrator deletion", async () => {
    await expect(deleteAccount(USER_B, "owner@example.com")).rejects.toMatchObject({ code: "CONFIRMATION_MISMATCH" } satisfies Partial<AccountDataError>);
    await expect(deleteAccount(USER_ADMIN, "admin@example.com")).rejects.toMatchObject({ code: "ADMIN_HANDOFF_REQUIRED" } satisfies Partial<AccountDataError>);
    const result = await database.query<{ status: string }>(`select status from users where id='${USER_B}'`);
    expect(result.rows[0]?.status).toBe("active");
  });

  it("atomically invalidates sessions, erases learning data and anonymizes retained records", async () => {
    const issued = await issueSessionToken(USER_A);
    expect((await getSessionByToken(issued.token))?.user.id).toBe(USER_A);
    const first = await deleteAccount(USER_A, "OWNER@example.com", new Date("2026-10-01T10:00:00.000Z"));
    expect(first.status).toBe("deleted");
    expect(await getSessionByToken(issued.token)).toBeNull();
    await expect(issueSessionToken(USER_A)).rejects.toThrow("ACCOUNT_UNAVAILABLE");
    expect((await database.query(`select 1 from user_sessions where user_id='${USER_A}'`)).rows).toHaveLength(0);
    expect((await database.query(`select 1 from profiles where id='${USER_A}'`)).rows).toHaveLength(0);
    expect((await database.query(`select 1 from learner_goals where user_id='${USER_A}'`)).rows).toHaveLength(0);
    expect((await database.query(`select 1 from lifecycle_emails where user_id='${USER_A}'`)).rows).toHaveLength(0);

    const user = await database.query<{ email: string; status: string; deleted_at: Date }>(`select email,status,deleted_at from users where id='${USER_A}'`);
    expect(user.rows[0]).toMatchObject({ email: `deleted+${USER_A}@deleted.invalid`, status: "disabled" });
    expect(user.rows[0]?.deleted_at).toBeTruthy();

    const payment = await database.query<{ checkout_url: string | null }>(`select checkout_url from payment_orders where user_id='${USER_A}'`);
    expect(payment.rows).toHaveLength(2);
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

  it("rejects delayed writes and administrator reactivation of a tombstone", async () => {
    await expect(database.exec(`insert into learner_goals(user_id,target_score) values ('${USER_A}',750)`)).rejects.toThrow("ACCOUNT_DELETED");
    await expect(database.exec(`update users set status='active' where id='${USER_A}'`)).rejects.toThrow("ACCOUNT_DELETED");
    await expect(exportLearningData(USER_A)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("records a late payment without restoring access or learner analytics", async () => {
    await applyVerifiedPayment({ eventKey: "task42-late", orderCode: 420002, amountVnd: 99000, currency: "VND", providerPaymentId: "late-provider", paid: true }, "FAKE");
    expect((await database.query(`select 1 from user_plan_memberships where user_id='${USER_A}' and revoked_at is null`)).rows).toHaveLength(0);
    expect((await database.query(`select status from payment_orders where order_code=420002`)).rows[0]).toEqual({ status: "PAID" });
    expect((await database.query(`select 1 from product_events where user_id='${USER_A}'`)).rows).toHaveLength(0);
  });

  it("rolls back every deletion change on a failure and permits a clean retry", async () => {
    await database.exec(`create function task42_fail_delete() returns trigger language plpgsql as $$ begin raise exception 'TASK42_ROLLBACK'; end; $$;
      create trigger task42_fail_delete before delete on learner_goals for each row execute function task42_fail_delete();`);
    await expect(deleteAccount(USER_B, "other@example.com")).rejects.toThrow();
    expect((await database.query(`select 1 from user_sessions where user_id='${USER_B}'`)).rows).toHaveLength(1);
    expect((await database.query(`select status from users where id='${USER_B}'`)).rows[0]).toEqual({ status: "active" });
    await database.exec("drop trigger task42_fail_delete on learner_goals; drop function task42_fail_delete();");
    expect((await deleteAccount(USER_B, "other@example.com")).status).toBe("deleted");
  });

  it("keeps settlement reference but no checkout if deletion wins a provider-response race", async () => {
    vi.stubEnv("PAYMENT_PROVIDER", "FAKE");
    vi.stubEnv("PREMIUM_30_PRICE_VND", "99000");
    const userId = "10000000-0000-4000-8000-000000000007";
    await database.exec(`insert into users(id,email,email_normalized,status) values('${userId}','checkout@example.com','checkout@example.com','active')`);
    const provider = new FakePaymentProvider();
    const originalCreate = provider.create.bind(provider);
    vi.spyOn(provider, "create").mockImplementation(async input => {
      const created = await originalCreate(input);
      await deleteAccount(userId, "checkout@example.com");
      return created;
    });
    await expect(createPaymentOrder(userId, "PREMIUM_30_DAYS", provider)).rejects.toThrow("ACCOUNT_UNAVAILABLE");
    const result = await database.query<{ order_code: number; provider_payment_id: string; checkout_url: string | null; amount: number }>(`select order_code,provider_payment_id,checkout_url,amount from payment_orders where user_id='${userId}'`);
    const order = result.rows[0]!;
    expect(order.checkout_url).toBeNull();
    expect(order.provider_payment_id).toBeTruthy();
    await applyVerifiedPayment({ eventKey: "checkout-race-late-payment", orderCode: Number(order.order_code), amountVnd: order.amount, currency: "VND", providerPaymentId: order.provider_payment_id, paid: true }, "FAKE");
    expect((await database.query(`select 1 from user_plan_memberships where user_id='${userId}'`)).rows).toHaveLength(0);
    expect((await database.query(`select status from payment_orders where user_id='${userId}'`)).rows[0]).toEqual({ status: "PAID" });
  });
});
