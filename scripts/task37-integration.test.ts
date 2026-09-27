import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test, vi } from "vitest";

vi.mock("server-only", () => ({}));

test.skipIf(process.env.TASK37_POSTGRES_QA !== "1")("Free/Premium server enforcement on isolated PostgreSQL", async () => {

const url = new URL(process.env.DATABASE_URL ?? "");
assert.deepEqual({ host: url.hostname, port: url.port, database: url.pathname, user: url.username },
  { host: "127.0.0.1", port: "15433", database: "/toeicgym_task17", user: "toeicgym_test" });
const { db, pool } = await import("../src/db/index.ts");
const { PLAN_CATALOG, PLAN_CAPABILITIES } = await import("../src/lib/entitlements/catalog.ts");
const { consumeUsage, getEffectiveCapabilities, getMembershipState, getUsageStatus, UsageLimitError } = await import("../src/lib/entitlements/service.ts");
const { getDiagnosticEligibility } = await import("../src/lib/diagnostic/service.ts");
const { createMasteryReviewSession } = await import("../src/lib/practice/selector.ts");
const { getAdvancedMockHistory, getMockHubReadiness, createMockRun } = await import("../src/lib/full-mock/service.ts");
const { getMistakeBank } = await import("../src/lib/mastery/queries.ts");
const { getPracticeResult } = await import("../src/lib/practice/queries.ts");
const ids: string[] = [];
const now = new Date();

async function user() {
  const id = randomUUID();
  const email = `task37-${id}@qa.invalid`;
  await pool.query("insert into users(id,email,email_normalized,status,email_verified_at) values($1,$2,$2,'active',now())", [id, email]);
  ids.push(id);
  return id;
}
async function consume(userId: string, entitlement: keyof typeof PLAN_CATALOG.FREE.entitlements) {
  return db.transaction(tx => consumeUsage(tx, { userId, entitlement, sourceType: entitlement === "FULL_MOCK" ? "FULL_MOCK_RUN" : "PRACTICE_SESSION", sourceId: randomUUID(), now }));
}

try {
  const free = await user(), premium = await user(), expired = await user();
  for (const [id, end] of [[premium, "10 days"], [expired, "-1 day"]]) {
    await pool.query("insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM','MANUAL',now()-interval '40 days',now()+$2::interval)", [id, end]);
  }
  for (const [id, plan] of [[free, "FREE"], [premium, "PREMIUM"], [expired, "FREE"]] as const) {
    assert.deepEqual(await getEffectiveCapabilities(id), { plan, ...PLAN_CAPABILITIES[plan] });
    for (const key of Object.keys(PLAN_CATALOG.FREE.entitlements) as Array<keyof typeof PLAN_CATALOG.FREE.entitlements>) {
      const limit = PLAN_CATALOG.FREE.entitlements[key];
      assert.equal(limit.type, "LIMITED");
      if (limit.type !== "LIMITED") throw new Error("Expected limited Free entitlement");
      const available = (await getUsageStatus(id)).entitlements[key];
      if (available.type === "LIMITED") assert.equal(available.remaining, limit.count);
      for (let n = 0; n < limit.count; n++) await consume(id, key);
      if (plan === "PREMIUM") {
        await consume(id, key);
        assert.equal((await getUsageStatus(id)).entitlements[key].type, "UNLIMITED");
      } else {
        await assert.rejects(consume(id, key), UsageLimitError);
        const exhausted = (await getUsageStatus(id)).entitlements[key];
        assert.equal(exhausted.type, "LIMITED");
        if (exhausted.type === "LIMITED") assert.equal(exhausted.remaining, 0);
        await assert.rejects(createMasteryReviewSession(id, 5, { smart: true }), /PREMIUM_REQUIRED/);
        assert.equal(await getAdvancedMockHistory(id), null);
      }
    }
  }
  assert.equal((await getMembershipState(expired)).status, "EXPIRED");
  assert.equal((await getDiagnosticEligibility(free)).status, "NEEDS_BASELINE");
  for (const id of [free, premium, expired]) {
    await pool.query("insert into diagnostic_runs(user_id,status,expires_at,completed_at,blueprint_version,purpose) values($1,'COMPLETED',now()+interval '1 day',now()-interval '1 day','v1','BASELINE')", [id]);
  }
  assert.equal((await getDiagnosticEligibility(free)).status, "FREE_NOT_ELIGIBLE");
  assert.equal((await getDiagnosticEligibility(expired)).status, "FREE_NOT_ELIGIBLE");
  assert.equal((await getDiagnosticEligibility(premium)).status, "COOLDOWN");
  await pool.query("update diagnostic_runs set completed_at=now()-interval '31 days' where user_id=$1", [premium]);
  assert.equal((await getDiagnosticEligibility(premium)).status, "ELIGIBLE");

  // Stored answers and basic explanations remain accessible when the same membership expires.
  const q = (await pool.query("select q.id, qs.correct_option_id from questions q join question_solutions qs on qs.question_id=q.id where q.toeic_part=5 and q.status='published' limit 1")).rows[0];
  assert(q, "Isolated fixture needs published Part 5 content");
  const session = (await pool.query("insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total) values($1,'READING','part_5',5,'submitted',1,1,'custom',now(),0,1) returning id", [premium])).rows[0].id;
  await pool.query("insert into practice_session_questions(session_id,question_id,display_order) values($1,$2,1)", [session, q.id]);
  await pool.query("insert into attempt_answers(session_id,user_id,question_id,is_correct,answered_at) values($1,$2,$3,false,now())", [session, premium, q.id]);
  await pool.query("insert into question_mastery(user_id,question_id,status,first_missed_at,last_missed_at) values($1,$2,'UNRESOLVED',now(),now())", [premium, q.id]);
  const resultBefore = await getPracticeResult(session, { userId: premium });
  assert(resultBefore);
  assert.equal((await getMistakeBank(premium, "UNRESOLVED")).length, 1);
  const smart = await createMasteryReviewSession(premium, 5, { smart: true });
  assert(smart);
  await pool.query("update user_plan_memberships set ends_at=now()-interval '1 second' where user_id=$1", [premium]);
  assert.equal((await getEffectiveCapabilities(premium)).plan, "FREE");
  assert.deepEqual(await getPracticeResult(session, { userId: premium }), resultBefore);
  assert.equal((await getMistakeBank(premium, "UNRESOLVED")).length, 1);
  await assert.rejects(createMasteryReviewSession(premium, 5, { smart: true }), /PREMIUM_REQUIRED/);
  assert.equal(await createMasteryReviewSession(premium, 5), smart, "Owned review resumes with Free access");
  assert.equal(await getAdvancedMockHistory(premium), null);

  const readiness = await getMockHubReadiness();
  const unavailable = (["LISTENING", "READING", "FULL"] as const).filter(mode => !readiness[mode === "FULL" ? "full" : mode === "READING" ? "reading" : "listening"].ready);
  assert(unavailable.length > 0, "QA requires at least one unavailable Mock mode");
  for (const mode of unavailable) assert.deepEqual(await createMockRun(free, mode), { ok: false, reason: "CONTENT_NOT_READY" });
  assert.equal(Number((await pool.query("select count(*) from payment_orders where user_id=any($1::uuid[])", [ids])).rows[0].count), 0);
  console.log(JSON.stringify({ status: "PASS", free: true, premium: true, expired: true, quotas: 4, smartReview: true, historyAndExplanationsRetained: true, reassessmentCooldown: true, unavailableMockModes: unavailable, paymentsCreated: 0 }));
} finally {
  if (ids.length) await pool.query("delete from users where id=any($1::uuid[])", [ids]);
  await pool.end();
}
}, 120_000);
