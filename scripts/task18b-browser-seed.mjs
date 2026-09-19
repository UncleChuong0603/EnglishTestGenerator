import assert from "node:assert/strict";
import pg from "pg";
import argon2 from "argon2";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.equal(url.hostname, "127.0.0.1"); assert.equal(url.port, "15433");
assert.equal(url.pathname, "/toeicgym_task17"); assert.equal(url.username, "toeicgym_test");
const pool = new pg.Pool({ connectionString: url.href });
try {
  const identity = (await pool.query("select current_database() database,current_user db_user")).rows[0];
  assert.deepEqual(identity, { database: "toeicgym_task17", db_user: "toeicgym_test" });
  const passwordHash = await argon2.hash("Task18b-browser-2026!", { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1, hashLength: 32 });
  const user = (await pool.query(`insert into users(email,email_normalized,password_hash,email_verified_at,status) values ('admin@task18b.invalid','admin@task18b.invalid',$1,now(),'active') on conflict (email_normalized) do update set password_hash=excluded.password_hash,email_verified_at=now(),status='active' returning id`, [passwordHash])).rows[0];
  await pool.query(`insert into profiles(id,full_name,interface_language) values ($1,'Task 18B Admin','vi') on conflict (id) do update set interface_language='vi'`, [user.id]);
  await pool.query(`insert into user_roles(user_id,role,created_by) select $1,'ADMIN',$1 where not exists (select 1 from user_roles where user_id=$1 and role='ADMIN' and revoked_at is null)`, [user.id]);
  await pool.query(`delete from content_posts where slug like 'task-18b-playwright%'`);
  console.log(JSON.stringify({ email: "admin@task18b.invalid" }));
} finally { await pool.end(); }
