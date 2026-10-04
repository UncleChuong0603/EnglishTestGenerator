import assert from "node:assert/strict";
import pg from "pg";
import { assertTestDatabase } from "./lib/assert-test-database.mjs";
import { productWeekStart } from "../src/lib/weekly-plan/policy.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL_REQUIRED");
await assertTestDatabase(databaseUrl);
const pool = new pg.Pool({ connectionString: databaseUrl });

const user = (await pool.query<{ id: string }>("select id from users where email_normalized='learner@task50.invalid' limit 1")).rows[0];
assert.ok(user, "Run the Task 50 integration seed first");

await pool.query("begin");
try {
  await pool.query("delete from weekly_plan_snapshots where user_id=$1", [user.id]);
  await pool.query("delete from learner_goals where user_id=$1", [user.id]);
  await pool.query("delete from question_mastery where user_id=$1", [user.id]);
  await pool.query("delete from full_mock_runs where user_id=$1", [user.id]);
  await pool.query("delete from diagnostic_runs where user_id=$1", [user.id]);
  await pool.query("delete from practice_sessions where user_id=$1", [user.id]);
  await pool.query("delete from questions where metadata->>'qaTask'='51'");
  await pool.query("delete from passage_sets where metadata->>'qaTask'='51'");

  await pool.query(`insert into learner_goals(user_id,target_score,exam_date,daily_study_minutes,study_days_per_week)
    values($1,750,'2026-11-15',30,5)`, [user.id]);
  await pool.query(`insert into diagnostic_runs(user_id,status,expires_at,completed_at,blueprint_version,purpose)
    values($1,'COMPLETED',now()+interval '30 days',now()-interval '12 days','toeic-lr-v1','BASELINE')`, [user.id]);
  await pool.query(`insert into full_mock_runs(user_id,mode,status,listening_started_at,listening_deadline,listening_completed_at,completed_at)
    values($1,'LISTENING','COMPLETED',now()-interval '10 days 1 hour',now()-interval '10 days',now()-interval '10 days',now()-interval '10 days')`, [user.id]);

  const listeningSet = (await pool.query<{ id: string }>(`insert into passage_sets(toeic_part,skill_area,set_type,title,metadata,status)
    values(2,'LISTENING','part2','Task 51 QA Listening',jsonb_build_object('qaTask','51'),'draft') returning id`)).rows[0]!;
  const questions = (await pool.query<{ id: string; toeic_part: number }>(`insert into questions(toeic_part,skill_area,question_type,skill,sub_skill,difficulty,question_text,status,metadata,passage_set_id,question_order)
    select case when n<=60 then 2 else 5 end,
      case when n<=60 then 'LISTENING' else 'READING' end,
      'qa', case when n<=60 then 'respond_to_questions' else 'grammar' end,
      case when n<=60 then 'detail' else 'verbs' end,
      'medium', 'Task 51 QA evidence '||n, 'draft', jsonb_build_object('qaTask','51'),
      case when n<=60 then $1::uuid else null end, case when n<=60 then n else 1 end
    from generate_series(1,120) n returning id,toeic_part`, [listeningSet.id])).rows;
  const listeningSession = (await pool.query<{ id: string }>(`insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total)
    values($1,'LISTENING','listening_part_2',2,'submitted',60,60,'custom',now()-interval '1 day',52,60) returning id`, [user.id])).rows[0]!;
  const readingSession = (await pool.query<{ id: string }>(`insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total)
    values($1,'READING','part_5',5,'submitted',60,60,'custom',now()-interval '1 day',45,60) returning id`, [user.id])).rows[0]!;
  let listeningIndex = 0;
  let readingIndex = 0;
  const wrongIds: string[] = [];
  for (const question of questions) {
    const listening = question.toeic_part === 2;
    const index = listening ? listeningIndex++ : readingIndex++;
    const correct = index < (listening ? 52 : 45);
    const sessionId = listening ? listeningSession.id : readingSession.id;
    const answeredAt = new Date(Date.now() - (index % 14) * 86_400_000);
    await pool.query(`insert into practice_session_questions(session_id,question_id,display_order,passage_set_id) values($1,$2,$3,$4)`, [sessionId, question.id, index + 1, listening ? listeningSet.id : null]);
    await pool.query(`insert into attempt_answers(session_id,user_id,question_id,is_correct,answered_at) values($1,$2,$3,$4,$5)`, [sessionId, user.id, question.id, correct, answeredAt]);
    if (!correct && wrongIds.length < 3) wrongIds.push(question.id);
  }
  for (const questionId of wrongIds) await pool.query(`insert into question_mastery(user_id,question_id,status,first_missed_at,last_missed_at) values($1,$2,'UNRESOLVED',now()-interval '5 days',now()-interval '1 day')`, [user.id, questionId]);
  await pool.query(`insert into weekly_plan_snapshots(user_id,week_start,signature,items,adjustment_reasons)
    values($1,$2,'task51-qa',$3::jsonb,'[]'::jsonb)`, [user.id, productWeekStart(), JSON.stringify([
      { slot: 1, activity: "LISTENING", minutes: 30, reason: "balance" },
      { slot: 2, activity: "READING", minutes: 30, reason: "balance" },
      { slot: 3, activity: "REVIEW", minutes: 20, reason: "mistakes" },
    ])]);
  await pool.query("commit");
  console.log("TASK51_QA_SEED_PASS");
} catch (error) {
  await pool.query("rollback");
  throw error;
} finally {
  await pool.end();
}
