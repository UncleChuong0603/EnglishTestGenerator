import assert from "node:assert/strict";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.deepEqual({ host: url.hostname, port: url.port, database: url.pathname, user: url.username }, { host: "127.0.0.1", port: "15433", database: "/toeicgym_task17", user: "toeicgym_test" });
const pool = new pg.Pool({ connectionString: url.href });
const states = ["new", "diagnosed", "active", "resumable", "complete", "quota", "premium", "no-goal", "partial-goal"];

async function user(state) {
  const email = `task26b-${state}@qa.invalid`;
  const row = (await pool.query(`insert into users(email,email_normalized,password_hash,email_verified_at,status) values($1,$1,'qa-only',now(),'active') on conflict(email_normalized) do update set status='active',email_verified_at=now() returning id`, [email])).rows[0];
  await pool.query(`insert into profiles(id,full_name,interface_language,explanation_language,ranking_visibility) values($1,$2,'vi','both','HIDDEN') on conflict(id) do update set full_name=excluded.full_name,interface_language='vi'`, [row.id, `QA ${state.toUpperCase()}`]);
  return { id: row.id, email };
}

async function submitted(userId, count) {
  const questions = (await pool.query(`select q.id,qs.correct_option_id from questions q join question_solutions qs on qs.question_id=q.id where q.status='published' and q.toeic_part=5 order by q.id limit $1`, [count])).rows;
  assert.equal(questions.length, count);
  const session = (await pool.query(`insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total) values($1,'READING','part_5',5,'submitted',$2,$2,'custom',now(),$2,$2) returning id`, [userId, count])).rows[0];
  for (const [i, q] of questions.entries()) {
    await pool.query(`insert into practice_session_questions(session_id,question_id,display_order) values($1,$2,$3)`, [session.id, q.id, i + 1]);
    await pool.query(`insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at) values($1,$2,$3,$4,true,now())`, [session.id, userId, q.id, q.correct_option_id]);
  }
}

try {
  await pool.query(`delete from users where email_normalized like 'task26b-%@qa.invalid'`);
  const fixtures = Object.fromEntries(await Promise.all(states.map(async state => [state, await user(state)])));
  for (const state of ["diagnosed", "active", "resumable", "complete", "quota", "premium", "no-goal", "partial-goal"]) {
    await pool.query(`insert into diagnostic_runs(user_id,status,expires_at,completed_at,blueprint_version,purpose) values($1,'COMPLETED',now()+interval '1 day',now()-interval '1 day','qa','BASELINE')`, [fixtures[state].id]);
  }
  for (const state of ["active", "resumable", "quota", "premium", "partial-goal"]) await submitted(fixtures[state].id, 4);
  await submitted(fixtures.complete.id, 10);
  for (const state of ["active", "resumable", "complete", "quota", "premium"]) await pool.query(`insert into learner_goals(user_id,target_score,exam_date,daily_study_minutes,study_days_per_week) values($1,800,current_date+60,20,5)`, [fixtures[state].id]);
  await pool.query(`insert into learner_goals(user_id,target_score,study_days_per_week) values($1,750,3)`, [fixtures["partial-goal"].id]);
  await pool.query(`insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source) values($1,'READING','part_5',5,'in_progress',5,5,'custom')`, [fixtures.resumable.id]);
  await pool.query(`insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM','MANUAL',now()-interval '1 day',now()+interval '90 days')`, [fixtures.premium.id]);
  await pool.query(`insert into usage_consumptions(user_id,entitlement_key,quantity,source_type,source_id) values($1,'TODAYS_WORKOUT',1,'PRACTICE_SESSION',gen_random_uuid())`, [fixtures.quota.id]);
  console.log(JSON.stringify(Object.fromEntries(Object.entries(fixtures).map(([state, value]) => [state, value.email]))));
} finally { await pool.end(); }
