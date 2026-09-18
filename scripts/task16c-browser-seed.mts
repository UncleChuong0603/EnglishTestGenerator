import assert from "node:assert/strict";
import pg from "pg";
import { hashPassword } from "../src/lib/auth/crypto.ts";

const url = new URL(process.env.TASK16_TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "");
assert.equal(url.hostname, "127.0.0.1");
assert.equal(url.port, "15433");
const pool = new pg.Pool({ connectionString: url.href });
try {
  const passwordHash = await hashPassword("Task16c-browser-2026!");
  await pool.query(`update users set email=lower(email),email_normalized=lower(email_normalized) where email_normalized like '%@task16d.invalid'`);
  await pool.query(
    `update users set password_hash=$1 where email_normalized in
     ('admin@task16c.invalid','alice@task16c.invalid','bob@task16c.invalid')
     or email_normalized like '%@task16d.invalid'`,
    [passwordHash],
  );
  const result = await pool.query(
    `select c.id challenge_id,r.id run_id from ranked_challenges c
     left join ranked_challenge_runs r on r.challenge_id=c.id
     join users u on u.id=r.user_id
     where u.email_normalized='alice@task16c.invalid' and r.status='COMPLETED'
     order by r.completed_at desc limit 1`,
  );
  if (!result.rows[0]) throw new Error("TASK16C_BROWSER_FIXTURE_MISSING");
  await pool.query(
    `update ranked_challenges set starts_at=now()-interval '1 minute',
     ends_at=now()+interval '3 hours' where id=$1`,
    [result.rows[0].challenge_id],
  );
  console.log(JSON.stringify(result.rows[0]));
} finally {
  await pool.end();
}
