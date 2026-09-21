import assert from "node:assert/strict";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.deepEqual({ host: url.hostname, port: url.port, database: url.pathname, user: url.username }, { host: "127.0.0.1", port: "15433", database: "/toeicgym_task17", user: "toeicgym_test" });
const pool = new pg.Pool({ connectionString: url.href });
try {
  const active = (await pool.query(`select id from users where email_normalized='task26b-active@qa.invalid'`)).rows[0];
  const resume = (await pool.query(`select id from users where email_normalized='task26b-resumable@qa.invalid'`)).rows[0];
  const noGoal = (await pool.query(`select id from users where email_normalized='task26b-no-goal@qa.invalid'`)).rows[0];
  const daily = async (userId: string, start: string, end: string) => (await pool.query(`select count(distinct aa.id)::int completed from attempt_answers aa join practice_sessions ps on ps.id=aa.session_id and ps.user_id=aa.user_id where aa.user_id=$1 and ps.status='submitted' and ps.source not in ('diagnostic','full_mock','ranked_challenge') and ps.practice_type<>'demo_test' and aa.answered_at is not null and aa.answered_at >= $2 and aa.answered_at < $3`, [userId, start, end])).rows[0].completed;
  const todayStart = new Date(); todayStart.setUTCHours(17, 0, 0, 0); if (todayStart > new Date()) todayStart.setUTCDate(todayStart.getUTCDate() - 1);
  assert.equal(await daily(active.id, todayStart.toISOString(), new Date(todayStart.getTime() + 86400000).toISOString()), 4);
  assert.equal((await pool.query(`select part from practice_sessions where user_id=$1 and status='in_progress' and source not in ('diagnostic','full_mock','ranked_challenge') and practice_type<>'demo_test' and (expires_at is null or expires_at>now()) order by started_at desc limit 1`, [resume.id])).rows[0].part, 5);
  assert.equal((await pool.query(`select count(*)::int n from learner_goals where user_id=$1`, [noGoal.id])).rows[0].n, 0);

  const email = "task26b-boundary@qa.invalid";
  const user = (await pool.query(`insert into users(email,email_normalized,password_hash,email_verified_at,status) values($1,$1,'qa-only',now(),'active') on conflict(email_normalized) do update set status='active' returning id`, [email])).rows[0];
  await pool.query(`delete from practice_sessions where user_id=$1`, [user.id]);
  const questions = (await pool.query(`select q.id,qs.correct_option_id from questions q join question_solutions qs on qs.question_id=q.id where q.status='published' and q.toeic_part=5 order by q.id limit 2`)).rows;
  for (const [i, answeredAt] of ["2026-09-21T16:59:59.000Z", "2026-09-21T17:00:00.000Z"].entries()) {
    const session = (await pool.query(`insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total) values($1,'READING','part_5',5,'submitted',1,1,'custom',$2,1,1) returning id`, [user.id, answeredAt])).rows[0];
    await pool.query(`insert into practice_session_questions(session_id,question_id,display_order) values($1,$2,1)`, [session.id, questions[i].id]);
    await pool.query(`insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at) values($1,$2,$3,$4,true,$5)`, [session.id, user.id, questions[i].id, questions[i].correct_option_id, answeredAt]);
  }
  assert.equal(await daily(user.id, "2026-09-21T17:00:00.000Z", "2026-09-22T17:00:00.000Z"), 1);
  console.log("TASK26B_DB_INTEGRATION_PASS", JSON.stringify({ dailyActivity: 4, distinctAnswers: true, resume: true, noGoal: true, boundary2359Excluded: true, boundary0000Included: true, timezone: "Asia/Ho_Chi_Minh" }));
} finally { await pool.end(); }
