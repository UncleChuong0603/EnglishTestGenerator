import assert from "node:assert/strict";
import argon2 from "argon2";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.equal(process.env.TASK29_QA, "1");
assert.match(url.hostname, /^task29-[a-zA-Z0-9-]+-pg$/);
assert.equal(url.pathname, "/task29");
const pool = new pg.Pool({ connectionString: url.href });

try {
  const passwordHash = await argon2.hash("Task29TestPassword123!", { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1, hashLength: 32 });
  const user = (await pool.query("insert into users(email,email_normalized,password_hash,email_verified_at,status) values('task29-existing@qa.invalid','task29-existing@qa.invalid',$1,now(),'active') returning id", [passwordHash])).rows[0];
  await pool.query("insert into profiles(id,full_name,interface_language,explanation_language,ranking_visibility) values($1,'Task 29 Existing','vi','both','HIDDEN')", [user.id]);
  for (let i = 1; i <= 20; i++) {
    const question = (await pool.query("insert into questions(toeic_part,skill_area,question_type,skill,sub_skill,difficulty,question_text,status,published_at) values(5,'READING','INCOMPLETE_SENTENCE','GRAMMAR','VERB_FORM','easy',$1,'published',now()) returning id", [`Task 29 sample question ${i}: She ____ every day.`])).rows[0];
    let correctOptionId;
    for (const [index, [key, word]] of [["A", "works"], ["B", "work"], ["C", "working"], ["D", "worked"]].entries()) {
      const option = (await pool.query("insert into question_options(question_id,option_key,option_text,display_order) values($1,$2,$3,$4) returning id", [question.id, key, word, index + 1])).rows[0];
      if (index === 0) correctOptionId = option.id;
    }
    await pool.query("insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi) values($1,$2,'Third-person singular takes -s.','Ngôi thứ ba số ít dùng -s.')", [question.id, correctOptionId]);
  }
  console.log("TASK29_QA_SEED_PASS", JSON.stringify({ questions: 20, existingAccount: true }));
} finally { await pool.end(); }
