import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
const USER = "50000000-0000-4000-8000-000000000001";
const OTHER = "50000000-0000-4000-8000-000000000002";

beforeAll(async () => {
  const journal = JSON.parse(
    readFileSync("drizzle/meta/_journal.json", "utf8"),
  ) as { entries: Array<{ tag: string }> };
  for (const entry of journal.entries)
    await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
  await database.exec(
    `insert into users(id,email,email_normalized,status) values ('${USER}','dictation@example.com','dictation@example.com','active'),('${OTHER}','other@example.com','other@example.com','active')`,
  );
}, 30_000);

afterAll(async () => database.close());

describe("dictation migration", () => {
  it("persists bounded scoring metadata without learner answer text", async () => {
    const session = crypto.randomUUID();
    await database.exec(
      `insert into dictation_sessions(id,user_id,source_type,source_ref,content_fingerprint) values ('${session}','${USER}','TALK','first-day-at-work',repeat('a',64)); insert into dictation_attempts(session_id,user_id,attempt_number,accuracy,exact,used_hint) values ('${session}','${USER}',1,82,false,false)`,
    );
    const columns = await database.query<{ column_name: string }>(
      `select column_name from information_schema.columns where table_name='dictation_attempts'`,
    );
    expect(columns.rows.map((row) => row.column_name)).not.toContain("answer");
    await expect(
      database.exec(
        `insert into dictation_attempts(session_id,user_id,attempt_number,accuracy,exact,used_hint) values ('${session}','${USER}',2,101,false,false)`,
      ),
    ).rejects.toThrow();
  });

  it("cascades owned history and rejects unsupported sources", async () => {
    await expect(
      database.exec(
        `insert into dictation_sessions(user_id,source_type,source_ref,content_fingerprint) values ('${OTHER}','GENERATED','x',repeat('b',64))`,
      ),
    ).rejects.toThrow();
    await database.exec(`delete from users where id='${USER}'`);
    const rows = await database.query<{ count: number }>(
      `select count(*)::int as count from dictation_sessions where user_id='${USER}'`,
    );
    expect(rows.rows[0]?.count).toBe(0);
  });
});
