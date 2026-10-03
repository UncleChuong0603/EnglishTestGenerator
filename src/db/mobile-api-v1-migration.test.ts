import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: Array<{ tag: string }> };
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
}, 120_000);
afterAll(async () => database.close());

describe("Task 43 mobile API persistence", () => {
  it("creates draft and durable idempotency tables", async () => {
    const result = await database.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'");
    expect(result.rows.map((row) => row.table_name)).toEqual(expect.arrayContaining(["practice_answer_drafts", "api_idempotency_keys"]));
  });

  it("enforces one answer per session/question and scoped idempotency", async () => {
    await database.exec(`
      insert into users (id,email,email_normalized,status,email_verified_at) values ('10000000-0000-4000-8000-000000000001','mobile@example.com','mobile@example.com','active',now());
      insert into passage_sets (id,toeic_part,skill_area,set_type,title,status) values ('20000000-0000-4000-8000-000000000001',5,'READING','standalone','P5','published');
      insert into questions (id,toeic_part,skill_area,question_type,response_type,skill,sub_skill,difficulty,question_text,status) values ('30000000-0000-4000-8000-000000000001',5,'READING','multiple_choice','MULTIPLE_CHOICE','grammar','verbs','medium','Choose','published');
      insert into question_options (id,question_id,option_key,option_text,display_order) values ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','A','works',1);
      insert into practice_sessions (id,user_id,skill_area,practice_type,part,question_count,requested_question_count) values ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','READING','part_5',5,1,10);
      insert into practice_session_questions (session_id,question_id,display_order) values ('50000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001',1);
      insert into practice_answer_drafts (session_id,user_id,question_id,selected_option_id) values ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001');
      insert into api_idempotency_keys (user_id,operation,key_hash,request_hash,response_status,response_body,expires_at) values ('10000000-0000-4000-8000-000000000001','practice:create','key','body',201,'{}',now()+interval '1 day');
    `);
    await expect(database.exec("insert into api_idempotency_keys (user_id,operation,key_hash,request_hash,response_status,response_body,expires_at) values ('10000000-0000-4000-8000-000000000001','practice:create','key','other',201,'{}',now()+interval '1 day')")).rejects.toThrow();
    await expect(database.exec("insert into practice_answer_drafts (session_id,user_id,question_id,selected_option_id) values ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001')")).rejects.toThrow();
  });

  it("removes mobile state with account-owned rows", async () => {
    await database.exec("delete from users where id='10000000-0000-4000-8000-000000000001'");
    const [drafts, keys] = await Promise.all([database.query<{ count: number }>("select count(*)::int count from practice_answer_drafts"), database.query<{ count: number }>("select count(*)::int count from api_idempotency_keys")]);
    expect(drafts.rows[0].count).toBe(0); expect(keys.rows[0].count).toBe(0);
  });
});
