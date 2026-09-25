import assert from "node:assert/strict";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.deepEqual({ host: url.hostname, port: url.port, database: url.pathname, user: url.username },
  { host: "127.0.0.1", port: "15433", database: "/toeicgym_task17", user: "toeicgym_test" });
const pool = new pg.Pool({ connectionString: url.href });
const shifted = new Date(Date.now() + 7 * 3_600_000);
shifted.setUTCDate(shifted.getUTCDate() - ((shifted.getUTCDay() + 6) % 7));
shifted.setUTCHours(0, 0, 0, 0);
const currentStart = new Date(shifted.getTime() - 7 * 3_600_000);
const previousStart = new Date(currentStart.getTime() - 7 * 86_400_000);
const beforeStart = new Date(previousStart.getTime() - 7 * 86_400_000);

async function seedWeek(state, start, count, correct, plan) {
  const user = (await pool.query("select id from users where email_normalized=$1", [`task26b-${state}@qa.invalid`])).rows[0];
  assert(user, `Missing fixture ${state}`);
  const samples = (await pool.query("select q.id, qs.correct_option_id from questions q join question_solutions qs on qs.question_id=q.id where q.status='published' and q.toeic_part=5 order by q.id limit $1", [count])).rows;
  assert.equal(samples.length, count);
  const submitted = new Date(start.getTime() + 2 * 86_400_000);
  const session = (await pool.query("insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,started_at,submitted_at,score_correct,score_total) values($1,'READING','part_5',5,'submitted',$2,$2,'custom',$3,$3,$4,$2) returning id", [user.id, count, submitted, correct])).rows[0];
  for (const [index, sample] of samples.entries()) {
    const isCorrect = index < correct;
    const selected = isCorrect ? sample.correct_option_id : (await pool.query("select id from question_options where question_id=$1 and id<>$2 limit 1", [sample.id, sample.correct_option_id])).rows[0].id;
    await pool.query("insert into practice_session_questions(session_id,question_id,display_order) values($1,$2,$3)", [session.id, sample.id, index + 1]);
    await pool.query("insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at) values($1,$2,$3,$4,$5,$6)", [session.id, user.id, sample.id, selected, isCorrect, submitted]);
  }
  if (plan) await pool.query("insert into weekly_plan_snapshots(user_id,week_start,signature,items,adjustment_reasons) values($1,$2,'qa-plan',$3,'[]')", [user.id,
    new Date(start.getTime() + 7 * 3_600_000).toISOString().slice(0, 10), JSON.stringify([
      { slot: 1, activity: "READING", minutes: 20, reason: "balance" }, { slot: 2, activity: "REVIEW", minutes: 10, reason: "mistakes" },
      { slot: 3, activity: "LISTENING", minutes: 20, reason: "balance" },
    ])]);
}

try {
  await seedWeek("active", previousStart, 10, 5, true);
  await seedWeek("premium", previousStart, 10, 5, true);
  await seedWeek("premium", beforeStart, 10, 3, false);
  console.log("Task 35 isolated weekly fixtures seeded");
} finally { await pool.end(); }
