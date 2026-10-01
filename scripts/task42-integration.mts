import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.equal(process.env.TASK42_QA, "isolated-task42");
assert.equal(url.hostname, "task42-postgres");
assert.equal(url.pathname, "/toeicgym_task42");
assert.equal(url.username, "task42");
const { db, pool } = await import("../src/db");
const { deleteAccount, exportLearningData } = await import("../src/lib/account-data/service");
const { issueSessionToken, getSessionByToken } = await import("../src/lib/auth/session-core");
const { startPractice } = await import("../src/lib/practice/service");
const { applyVerifiedPayment, createPaymentOrder } = await import("../src/lib/payments/service");
const { FakePaymentProvider } = await import("../src/lib/payments/provider");
await migrate(db, { migrationsFolder: "drizzle" });
await migrate(db, { migrationsFolder: "drizzle" });
assert.equal(Number((await pool.query("select max(created_at) as value from drizzle.__drizzle_migrations")).rows[0].value), 1792627208000);
console.log("PostgreSQL migration + repeat migration: PASS");

const a = randomUUID(), b = randomUUID(), privateUser = randomUUID(), q = randomUUID();
async function user(id: string, label: string) {
  await pool.query("insert into users(id,email,email_normalized,status,email_verified_at) values($1,$2,$2,'active',now())", [id, label + "@task42.invalid"]);
  await pool.query("insert into profiles(id,full_name) values($1,$2)", [id, label]);
  await pool.query("insert into learner_goals(user_id,target_score) values($1,750)", [id]);
}
await user(a, "owner"); await user(b, "other"); await user(privateUser, "private");
const token = await issueSessionToken(a);
assert.equal((await getSessionByToken(token.token))?.user.id, a);
await pool.query("insert into questions(id,toeic_part,skill,sub_skill,question_type,question_text,difficulty,status,published_at,bank_pool) values($1,5,'grammar','verb_tense','part5','QA question','medium','published',now(),'MOCK')", [q]);
const session = randomUUID();
await pool.query("insert into practice_sessions(id,user_id,question_count,status,submitted_at,score_correct,score_total,submission_reason) values($1,$2,1,'submitted',now(),0,1,'mock_section_complete')", [session, a]);
await pool.query("insert into practice_session_questions(session_id,question_id,display_order,mastery_target_question_id) values($1,$2,1,$2)", [session, q]);
await pool.query("insert into attempt_answers(session_id,user_id,question_id,is_correct) values($1,$2,$3,false)", [session, a, q]);
await pool.query("insert into question_mastery(user_id,question_id,first_missed_at,last_missed_at) values($1,$2,now(),now())", [a, q]);
await pool.query("insert into question_reports(question_id,practice_session_id,reporter_user_id,source_type,reason,description) values($1,$2,$3,'PRACTICE','OTHER','My personal QA report')", [q, session, a]);
await pool.query("insert into user_vocabulary(user_id,entry_key,context_sentence,toeic_part) values($1,'meeting','QA context',5)", [a]);
await pool.query("insert into auth_identities(user_id,provider,provider_account_id) values($1,'google','private-provider-identity')", [a]);
await pool.query("insert into lifecycle_emails(user_id,type,window_key,status) values($1,'nudge','qa-only','sent')", [a]);
await pool.query("insert into payment_orders(user_id,product_key,provider,order_code,provider_payment_id,amount,status,checkout_url,expires_at) values($1,'PREMIUM_30_DAYS','FAKE',4242001,'qa-late-payment',99000,'PENDING','https://checkout.invalid/secret',now()+interval '1 day')", [a]);
await pool.query("insert into product_events(user_id,event_name,source,route,properties) values($1,'practice_started','server','/qa','{\"email\":\"private\"}')", [a]);
const exported = await exportLearningData(a);
assert.equal(exported.learning.answers.length, 1);
assert.equal(exported.learning.mistakeMastery.length, 1);
assert.equal(exported.learning.vocabulary.length, 1);
assert.equal(exported.communications.questionReports.length, 1);
assert.ok(!JSON.stringify(exported).includes("private-provider-identity"));
assert.ok(!JSON.stringify(exported).includes("https://checkout.invalid/secret"));
assert.ok(!JSON.stringify(exported).includes(b));
await assert.rejects(deleteAccount(b, "owner@task42.invalid"), { code: "CONFIRMATION_MISMATCH" });
console.log("Export ownership, Task 40/41 data and deletion authorization: PASS");

// A injected failure must restore all rows, including early deletions.
await pool.query("create function task42_fail() returns trigger language plpgsql as $$ begin raise exception 'QA_ROLLBACK'; end; $$; create trigger task42_fail before delete on learner_goals for each row execute function task42_fail()");
await assert.rejects(deleteAccount(a, "owner@task42.invalid"));
assert.equal((await pool.query("select count(*)::int as n from question_reports where reporter_user_id=$1", [a])).rows[0].n, 1);
assert.equal((await getSessionByToken(token.token))?.user.id, a);
await pool.query("drop trigger task42_fail on learner_goals; drop function task42_fail()");
console.log("Atomic rollback after early erasure: PASS");

await pool.query("insert into media_assets(kind,access_scope,storage_key,mime_type,byte_size,checksum,owner_user_id) values('IMAGE','PRIVATE_USER','qa-private','image/png',1,'qa',$1)", [privateUser]);
await assert.rejects(deleteAccount(privateUser, "private@task42.invalid"), { code: "PRIVATE_DATA_HANDOFF_REQUIRED" });
// Isolated row-lock test: a delayed request waits for an erasure lock then fails.
const lock = await pool.connect(), delayed = await pool.connect();
await lock.query("begin");
await lock.query("select id from users where id=$1 for update", [b]);
let finished = false;
const blockedWrite = delayed.query("insert into learner_contexts(user_id,study_purpose) values($1,'UPCOMING_EXAM')", [b]).then(() => { finished = true; return null; }, (error: Error) => { finished = true; return error; });
await new Promise(resolve => setTimeout(resolve, 100));
assert.equal(finished, false);
await lock.query("update users set deleted_at=now(),status='disabled',email='deleted-lock@deleted.invalid',email_normalized='deleted-lock@deleted.invalid',email_verified_at=null where id=$1", [b]);
await lock.query("commit");
const writeError = await blockedWrite;
assert.ok(writeError?.message.includes("ACCOUNT_DELETED"));
lock.release(); delayed.release();
console.log("PostgreSQL stale-write serialization + private-media fail-closed: PASS");

const results = await Promise.all([deleteAccount(a, "owner@task42.invalid"), deleteAccount(a, "owner@task42.invalid")]);
assert.deepEqual(results.map(result => result.status).sort(), ["already_deleted", "deleted"]);
assert.equal(await getSessionByToken(token.token), null);
await assert.rejects(issueSessionToken(a), /ACCOUNT_UNAVAILABLE/);
for (const [table, column] of [["profiles","id"],["practice_sessions","user_id"],["attempt_answers","user_id"],["question_mastery","user_id"],["user_vocabulary","user_id"],["user_sessions","user_id"],["auth_identities","user_id"],["lifecycle_emails","user_id"],["question_reports","reporter_user_id"]]) {
  assert.equal((await pool.query("select count(*)::int as n from " + table + " where " + column + "=$1", [a])).rows[0].n, 0);
}
await applyVerifiedPayment({ eventKey: "qa-late", orderCode: 4242001, amountVnd: 99000, currency: "VND", providerPaymentId: "qa-late-payment", paid: true }, "FAKE");
assert.equal((await pool.query("select status from payment_orders where order_code=4242001")).rows[0].status, "PAID");
assert.equal((await pool.query("select count(*)::int as n from user_plan_memberships where user_id=$1 and revoked_at is null", [a])).rows[0].n, 0);
assert.equal((await pool.query("select count(*)::int as n from product_events where user_id=$1", [a])).rows[0].n, 0);
console.log("Concurrent delete retry, session invalidation, erasure and late-payment retention: PASS");

// Existing selectors remain the implementation behind the new start boundary.
const learner = randomUUID(); await user(learner, "practice");
for (let i = 0; i < 20; i++) {
  const question = randomUUID();
  await pool.query("insert into questions(id,toeic_part,skill,sub_skill,question_type,question_text,difficulty,status,published_at,bank_pool) values($1,5,'grammar','verb_tense','part5','QA practice question','medium','published',now(),'MOCK')", [question]);
  let correct = "";
  for (let n = 1; n <= 4; n++) {
    const option = randomUUID(); if (n === 1) correct = option;
    await pool.query("insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,$3,'QA option',$4)", [option, question, String.fromCharCode(64+n), n]);
  }
  await pool.query("insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi) values($1,$2,'QA explanation','QA explanation')", [question, correct]);
}
const started = await startPractice(learner, { kind: "CUSTOM_READING", config: { mode: "part_5", targetQuestionCount: 10, source: "custom" } });
assert.ok(started);
assert.equal((await pool.query("select count(*)::int as n from practice_session_questions where session_id=$1", [started])).rows[0].n, 10);
console.log("Shared practice start with real selector/usage transaction: PASS");
const checkoutUser = randomUUID();
process.env.PAYMENT_PROVIDER = "FAKE";
process.env.PREMIUM_30_PRICE_VND = "99000";
await user(checkoutUser, "checkout-race");
const provider = new FakePaymentProvider(), originalCreate = provider.create.bind(provider);
provider.create = async input => {
  const result = await originalCreate(input);
  await deleteAccount(checkoutUser, "checkout-race@task42.invalid");
  return result;
};
await assert.rejects(createPaymentOrder(checkoutUser, "PREMIUM_30_DAYS", provider), /ACCOUNT_UNAVAILABLE/);
const raceOrder = (await pool.query("select * from payment_orders where user_id=$1", [checkoutUser])).rows[0];
assert.equal(raceOrder.checkout_url, null);
assert.ok(raceOrder.provider_payment_id);
await applyVerifiedPayment({ eventKey: "qa-provider-race", orderCode: Number(raceOrder.order_code), amountVnd: raceOrder.amount, currency: "VND", providerPaymentId: raceOrder.provider_payment_id, paid: true }, "FAKE");
assert.equal((await pool.query("select count(*)::int as n from user_plan_memberships where user_id=$1", [checkoutUser])).rows[0].n, 0);
console.log("Checkout provider-response/deletion race preserves settlement but not access: PASS");
await pool.end();
