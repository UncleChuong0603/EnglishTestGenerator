import assert from "node:assert/strict";
import pg from "pg";

const rawUrl = process.env.DATABASE_URL ?? "";
const url = new URL(rawUrl);
assert.ok(url.hostname === "127.0.0.1" || url.hostname === "localhost" || url.hostname === "toeicgym-task40-pg", "TASK40_REQUIRES_ISOLATED_DATABASE");
assert.notEqual(url.pathname, "/toeicgym", "TASK40_REFUSES_PRODUCTION_DATABASE");

const pool = new pg.Pool({ connectionString: rawUrl, max: 1 });
const client = await pool.connect();
const ids = {
  user: "40000000-0000-4000-8000-000000000001",
  group: "40000000-0000-4000-8000-000000000002",
  question: "40000000-0000-4000-8000-000000000003",
};

try {
  await client.query("begin");
  await client.query("insert into users(id,email,email_normalized,status) values ($1,'task40@isolated.test','task40@isolated.test','active')", [ids.user]);
  await client.query("insert into passage_sets(id,toeic_part,skill_area,set_type,title,status) values ($1,5,'READING','standalone','Task 40 isolated fixture','published')", [ids.group]);
  await client.query("insert into questions(id,toeic_part,skill_area,question_type,skill,sub_skill,difficulty,question_text,status,passage_set_id) values ($1,5,'READING','standalone','grammar','verb_tense','easy','Task 40 fixture','published',$2)", [ids.question, ids.group]);
  await client.query("insert into question_reports(question_id,question_group_id,reporter_user_id,source_type,reason,description) values ($1,$2,$3,'PRACTICE','ANSWER_INCORRECT','Evidence from a submitted result')", [ids.question, ids.group, ids.user]);

  await assert.rejects(
    client.query("insert into question_reports(question_id,question_group_id,reporter_user_id,source_type,reason) values ($1,$2,$3,'PRACTICE','OTHER')", [ids.question, ids.group, ids.user]),
    (error: unknown) => (error as { code?: string }).code === "23505",
  );
  await client.query("rollback");

  await client.query("begin");
  await client.query("insert into users(id,email,email_normalized,status) values ($1,'task40@isolated.test','task40@isolated.test','active')", [ids.user]);
  await client.query("insert into passage_sets(id,toeic_part,skill_area,set_type,title,status) values ($1,5,'READING','standalone','Task 40 isolated fixture','published')", [ids.group]);
  await client.query("insert into questions(id,toeic_part,skill_area,question_type,skill,sub_skill,difficulty,question_text,status,passage_set_id) values ($1,5,'READING','standalone','grammar','verb_tense','easy','Task 40 fixture','published',$2)", [ids.question, ids.group]);
  const created = await client.query<{ id: string }>("insert into question_reports(question_id,question_group_id,reporter_user_id,source_type,reason) values ($1,$2,$3,'PRACTICE','TYPO_GRAMMAR') returning id", [ids.question, ids.group, ids.user]);
  await client.query("update question_reports set status='RESOLVED',resolution_note='Correction reviewed and published',resolved_at=now() where id=$1", [created.rows[0].id]);
  await client.query("insert into question_reports(question_id,question_group_id,reporter_user_id,source_type,reason) values ($1,$2,$3,'PRACTICE','OTHER')", [ids.question, ids.group, ids.user]);
  const count = await client.query<{ value: number }>("select count(*)::int as value from question_reports where question_id=$1", [ids.question]);
  assert.equal(count.rows[0].value, 2);
  await client.query("rollback");
  console.log("Task 40 PostgreSQL integration PASS: migration, active duplicate guard, terminal workflow, and re-report after closure.");
} finally {
  client.release();
  await pool.end();
}
