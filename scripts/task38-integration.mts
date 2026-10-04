import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { pool as appPool } from "../src/db";
import { getEffectiveCapabilities, getEffectivePlan, getMembershipState, getUsageStatus } from "../src/lib/entitlements/service";
import { applyVerifiedPayment } from "../src/lib/payments/service";
import { activateTrial, getTrialEligibility } from "../src/lib/premium/trial";
import { TRIAL_DURATION_MS } from "../src/lib/premium/trial-policy";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.deepEqual({ host: url.hostname, port: url.port, database: url.pathname, user: url.username },
  { host: "127.0.0.1", port: "15438", database: "/toeicgym_task38", user: "toeicgym_task38" });
const raw = new pg.Pool({ connectionString: url.toString() });
const prefix = `task38-${Date.now()}-`;

async function user(name: string, verified = true) {
  const email = `${prefix}${name}@qa.invalid`;
  const result = await raw.query(`insert into users(email,email_normalized,email_verified_at,status) values($1,$1,$2,'active') returning id`, [email, verified ? new Date() : null]);
  const id = result.rows[0].id as string;
  await raw.query(`insert into profiles(id,full_name,interface_language,explanation_language,ranking_visibility) values($1,$2,'vi','both','HIDDEN')`, [id, `Task 38 ${name}`]);
  return id;
}

async function questions() {
  const result: Array<{ id: string; option: string }> = [];
  for (let index = 0; index < 20; index++) {
    const set = randomUUID(), id = randomUUID(), option = randomUUID();
    await raw.query(`insert into passage_sets(id,toeic_part,skill_area,set_type,title,status) values($1,5,'READING','standalone','Task 38 fixture','published')`, [set]);
    await raw.query(`insert into questions(id,toeic_part,skill_area,question_type,response_type,skill,sub_skill,difficulty,question_text,status,passage_set_id,question_order) values($1,5,'READING','single','MULTIPLE_CHOICE','grammar','tense','medium',$2,'published',$3,1)`, [id, `Trial fixture ${index}`, set]);
    await raw.query(`insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,'A','Fixture option',1)`, [option, id]);
    await raw.query(`insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi) values($1,$2,'Fixture.','Fixture.')`, [id, option]);
    result.push({ id, option });
  }
  return result;
}

async function learning(userId: string, items: Array<{ id: string; option: string }>, count = 20) {
  const now = Date.now();
  for (let day = 0; day < 2; day++) {
    const at = new Date(now - (day + 1) * 86_400_000);
    const session = (await raw.query(`insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,started_at,submitted_at,score_correct,score_total)
      values($1,'READING','part_5',5,'submitted',10,10,'custom',$2::timestamptz - interval '10 minutes',$2,10,10) returning id`, [userId, at])).rows[0].id as string;
    for (let i = 0; i < 10; i++) {
      const q = items[day * 10 + i];
      if (!q || day * 10 + i >= count) continue;
      await raw.query(`insert into practice_session_questions(session_id,question_id,display_order) values($1,$2,$3)`, [session, q.id, i + 1]);
      await raw.query(`insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at) values($1,$2,$3,$4,true,$5)`, [session, userId, q.id, q.option, at]);
    }
  }
}

try {
  const migration = await raw.query(`select max(id)::int as id from drizzle.__drizzle_migrations`);
  assert.equal(migration.rows[0].id, 45);
  const index = await raw.query(`select count(*)::int as total from pg_indexes where indexname='user_plan_memberships_trial_lifetime_uidx'`);
  assert.equal(index.rows[0].total, 1);
  const items = await questions();
  const fresh = await user("fresh");
  assert.equal((await getTrialEligibility(fresh)).reason, "INSUFFICIENT_DATA");
  assert.equal((await getTrialEligibility(randomUUID())).reason, "ACCOUNT");
  const unverified = await user("unverified", false);
  await learning(unverified, items);
  assert.equal((await getTrialEligibility(unverified)).reason, "ACCOUNT");
  const insufficient = await user("insufficient");
  await learning(insufficient, items, 19);
  assert.equal((await getTrialEligibility(insufficient)).reason, "INSUFFICIENT_DATA");
  const admin = await user("admin");
  await learning(admin, items);
  await raw.query(`insert into user_roles(user_id,role) values($1,'ADMIN')`, [admin]);
  assert.equal((await getTrialEligibility(admin)).reason, "ACCOUNT");
  const premium = await user("premium");
  await learning(premium, items);
  await raw.query(`insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM','ADMIN',now(),now()+interval '30 days')`, [premium]);
  assert.equal((await getTrialEligibility(premium)).reason, "PREMIUM");
  const pending = await user("pending");
  await learning(pending, items);
  await raw.query(`insert into payment_orders(user_id,product_key,provider,order_code,amount,currency,status,expires_at) values($1,'PREMIUM_30_DAYS','FAKE',$2,99000,'VND','PENDING',now()+interval '30 minutes')`, [pending, Number(`38${Date.now().toString().slice(-9)}`)]);
  assert.equal((await getTrialEligibility(pending)).reason, "PENDING_PAYMENT");

  const eligible = await user("eligible");
  await learning(eligible, items);
  assert.equal((await getTrialEligibility(eligible)).eligible, true);
  const cta = await user("cta");
  await learning(cta, items);
  assert.equal((await getTrialEligibility(cta)).eligible, true);
  const starts = await Promise.all(Array.from({ length: 8 }, () => activateTrial(eligible)));
  assert.equal(starts.filter(result => result.status === "STARTED").length, 1);
  assert.equal(starts.filter(result => result.status === "ALREADY_STARTED").length, 7);
  const membership = (await raw.query(`select starts_at,ends_at from user_plan_memberships where user_id=$1 and source='TRIAL'`, [eligible])).rows[0];
  assert.equal(new Date(membership.ends_at).getTime() - new Date(membership.starts_at).getTime(), TRIAL_DURATION_MS);
  assert.equal((await getTrialEligibility(eligible)).reason, "PREVIOUS_TRIAL");
  assert.equal((await getEffectivePlan(eligible)), "PREMIUM");
  assert.equal((await getUsageStatus(eligible)).entitlements.MANUAL_PRACTICE.type, "UNLIMITED");
  assert.equal((await getEffectiveCapabilities(eligible)).canUseSmartMistakeReview, true);
  const exact = new Date(membership.ends_at);
  assert.equal(await getEffectivePlan(eligible, new Date(exact.getTime() - 1)), "PREMIUM");
  assert.equal(await getEffectivePlan(eligible, exact), "FREE");
  assert.equal((await getMembershipState(eligible, exact)).status, "EXPIRED");
  assert.equal((await getUsageStatus(eligible, exact)).entitlements.MANUAL_PRACTICE.type, "LIMITED");
  assert.equal((await getEffectiveCapabilities(eligible, exact)).historyWindowDays, 30);
  assert.equal((await raw.query(`select count(*)::int n from attempt_answers where user_id=$1`, [eligible])).rows[0].n, 20);
  assert.equal((await raw.query(`select count(*)::int n from product_events where user_id=$1 and event_name='trial_expired'`, [eligible])).rows[0].n, 1);
  assert.equal((await activateTrial(eligible)).status, "ALREADY_STARTED");

  const converted = await user("converted");
  await learning(converted, items);
  assert.equal((await activateTrial(converted)).status, "STARTED");
  const orderCode = Number(`39${Date.now().toString().slice(-9)}`);
  await raw.query(`insert into payment_orders(user_id,product_key,provider,order_code,provider_payment_id,amount,currency,status,expires_at) values($1,'PREMIUM_30_DAYS','FAKE',$2,'qa-payment',99000,'VND','PENDING',now()+interval '30 minutes')`, [converted, orderCode]);
  const event = { eventKey: `task38:${orderCode}`, orderCode, amountVnd: 99000, currency: "VND" as const, providerPaymentId: "qa-payment", paid: true };
  assert.equal((await applyVerifiedPayment(event, "FAKE")).status, "PAID");
  assert.equal((await applyVerifiedPayment(event, "FAKE")).duplicate, true);
  assert.equal((await raw.query(`select count(*)::int n from product_events where user_id=$1 and event_name='trial_to_paid'`, [converted])).rows[0].n, 1);
  assert.equal((await raw.query(`select count(*)::int n from user_plan_memberships where user_id=$1 and source='TRIAL'`, [converted])).rows[0].n, 1);
  assert.equal((await raw.query(`select count(*)::int n from payment_orders where user_id=$1`, [eligible])).rows[0].n, 0);
  console.log("TASK38_POSTGRES_INTEGRATION_PASS");
} finally {
  await raw.end();
  await appPool.end();
}
