import assert from "node:assert/strict";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.equal(url.hostname, "task28b-pg-20260922");
assert.equal(url.pathname, "/task28b");
const pool = new pg.Pool({ connectionString: url.href });

async function user(name, premium = false) {
  const email = `task28b-${name}@qa.invalid`;
  const row = (await pool.query("insert into users(email,email_normalized,password_hash,email_verified_at,status) values($1,$1,'qa',now(),'active') returning id", [email])).rows[0];
  await pool.query("insert into profiles(id,full_name,interface_language,explanation_language,ranking_visibility) values($1,$2,'vi','both','HIDDEN')", [row.id, `QA ${name}`]);
  if (premium) await pool.query("insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM','MANUAL',now()-interval '1 day',now()+interval '30 days')", [row.id]);
  return row.id;
}

async function meaningful(userId) {
  const question = (await pool.query("select q.id, s.correct_option_id from questions q join question_solutions s on s.question_id=q.id limit 1")).rows[0];
  const session = (await pool.query("insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total) values($1,'READING','part_5',5,'submitted',1,1,'custom',now(),1,1) returning id", [userId])).rows[0];
  await pool.query("insert into practice_session_questions(session_id,question_id,display_order) values($1,$2,1)", [session.id, question.id]);
  await pool.query("insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at) values($1,$2,$3,$4,true,now())", [session.id, userId, question.id, question.correct_option_id]);
}

try {
  const question = (await pool.query("insert into questions(toeic_part,skill_area,question_type,skill,sub_skill,difficulty,question_text,status,published_at) values(5,'READING','INCOMPLETE_SENTENCE','GRAMMAR','VERB_FORM','easy','QA question','published',now()) returning id")).rows[0];
  const option = (await pool.query("insert into question_options(question_id,option_key,option_text,display_order) values($1,'A','works',1) returning id", [question.id])).rows[0];
  await pool.query("insert into question_solutions(question_id,correct_option_id,explanation_en) values($1,$2,'QA explanation')", [question.id, option.id]);

  const ids = {};
  for (const [name, premium] of [["inactive",false],["diagnostic-only",false],["eligible",false],["partial",false],["full",false],["dismissed",false],["other",false],["goal",false],["premium",true],["purpose-only",false],["source-only",false],["skip",false],["xss",false],["admin",false]]) ids[name] = await user(name, premium);
  for (const name of ["eligible","partial","full","dismissed","other","goal","premium","purpose-only","source-only","skip","xss"]) await meaningful(ids[name]);
  await pool.query("insert into learner_contexts(user_id,study_purpose) values($1,'GRADUATION_REQUIREMENT')", [ids.partial]);
  await pool.query("insert into learner_contexts(user_id,study_purpose,acquisition_source) values($1,'JOB_CAREER','FACEBOOK_GROUP')", [ids.full]);
  await pool.query("insert into learner_contexts(user_id,prompt_dismissed_at) values($1,now())", [ids.dismissed]);
  await pool.query("insert into learner_contexts(user_id,study_purpose,study_purpose_other,acquisition_source,acquisition_source_other) values($1,'OTHER','Trường yêu cầu chứng chỉ','OTHER','<img src=x onerror=alert(1)>')", [ids.other]);
  await pool.query("insert into learner_contexts(user_id,study_purpose,study_purpose_other,acquisition_source,acquisition_source_other) values($1,'OTHER','Some test value','OTHER','Old source')", [ids.xss]);
  await pool.query("insert into learner_goals(user_id,target_score,exam_date,daily_study_minutes,study_days_per_week) values($1,800,current_date+60,20,5)", [ids.goal]);
  await pool.query("insert into user_roles(user_id,role) values($1,'ADMIN')", [ids.admin]);
  await pool.query("insert into diagnostic_runs(user_id,status,expires_at,completed_at,blueprint_version,purpose) values($1,'COMPLETED',now()+interval '1 day',now(),'qa','BASELINE')", [ids["diagnostic-only"]]);
  console.log(JSON.stringify(ids));
} finally { await pool.end(); }
