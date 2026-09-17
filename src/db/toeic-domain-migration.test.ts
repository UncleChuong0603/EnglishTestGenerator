import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();

async function applyMigration(path: string) {
  const migration = readFileSync(path, "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) await database.exec(statement);
}

beforeAll(async () => {
  await applyMigration("drizzle/0000_lively_mordo.sql");
  await database.query("insert into passage_sets (id,toeic_part,set_type,title,status) values ('00000000-0000-4000-8000-000000000101',6,'part6','Existing Reading set','draft')");
  await applyMigration("drizzle/0001_icy_queen_noir.sql");
  await applyMigration("drizzle/0002_abandoned_mac_gargan.sql");
  await applyMigration("drizzle/0003_late_strong_guy.sql");
  await applyMigration("drizzle/0004_guest_practice.sql");
  await applyMigration("drizzle/0005_diagnostic_runs.sql");
  await applyMigration("drizzle/0006_mistake_mastery.sql");
  await applyMigration("drizzle/0007_full_mock_test.sql");
}, 30_000);

afterAll(async () => database.close());

describe("TOEIC domain migration", () => {
  it("adds append-only mastery state with one row per learner and question", async () => {
    const tables = await database.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'");
    expect(tables.rows.map((row) => row.table_name)).toContain("question_mastery");
    const constraints = await database.query<{ constraint_name: string }>("select constraint_name from information_schema.table_constraints where table_name='question_mastery'");
    expect(constraints.rows.map((row) => row.constraint_name)).toContain("question_mastery_user_question_unique");
  });
  it("adds authenticated Full Mock lifecycle and progressive answer storage", async () => {
    const tables = await database.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'");
    expect(tables.rows.map((row) => row.table_name)).toEqual(expect.arrayContaining(["full_mock_runs", "full_mock_answers"]));
    const indexes = await database.query<{ indexname: string }>("select indexname from pg_indexes where tablename='full_mock_runs'");
    expect(indexes.rows.map((row) => row.indexname)).toContain("full_mock_runs_one_active_user_idx");
  });
  it("backfills existing Reading data without changing its identity", async () => {
    const result = await database.query<{ id: string; skill_area: string }>("select id, skill_area from passage_sets where id='00000000-0000-4000-8000-000000000101'");
    expect(result.rows).toEqual([{ id: "00000000-0000-4000-8000-000000000101", skill_area: "READING" }]);
  });

  it("accepts a structurally valid Listening group and rejects invalid skill/part pairs", async () => {
    await expect(database.query("insert into passage_sets (toeic_part,skill_area,set_type,title) values (3,'LISTENING','conversation','Part 3 group')")).resolves.toBeDefined();
    await expect(database.query("insert into passage_sets (toeic_part,skill_area,set_type,title) values (7,'LISTENING','triple','Invalid')")).rejects.toThrow();
  });

  it("defaults current questions and responses to multiple choice", async () => {
    const columns = await database.query<{ column_name: string; column_default: string | null }>("select column_name,column_default from information_schema.columns where table_name='questions' and column_name in ('skill_area','response_type') order by column_name");
    expect(columns.rows.map((row) => row.column_name)).toEqual(["response_type", "skill_area"]);
    expect(columns.rows.every((row) => row.column_default !== null)).toBe(true);
  });

  it("adds media storage append-only without changing existing Reading rows", async () => {
    const tables = await database.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'");
    expect(tables.rows.map((row) => row.table_name)).toEqual(expect.arrayContaining(["media_assets", "question_group_media", "stimulus_media", "listening_transcripts"]));
    const existing = await database.query("select id from passage_sets where id='00000000-0000-4000-8000-000000000101'");
    expect(existing.rows).toHaveLength(1);
  });

  it("enforces exactly one authenticated or guest practice owner", async () => {
    await expect(database.query("insert into practice_sessions (skill_area,practice_type,question_count,guest_owner_hash,expires_at) values ('READING','mixed_reading',10,'guest-hash',now()+interval '7 days')")).resolves.toBeDefined();
    await expect(database.query("insert into practice_sessions (skill_area,practice_type,question_count) values ('READING','mixed_reading',10)")).rejects.toThrow();
    const [guest] = (await database.query<{ id: string }>("select id from practice_sessions where guest_owner_hash='guest-hash'")).rows;
    await database.query("insert into users (id,email,email_normalized,status) values ('00000000-0000-4000-8000-000000000099','guest@example.com','guest@example.com','active')");
    await database.query("update practice_sessions set user_id='00000000-0000-4000-8000-000000000099',guest_owner_hash=null,expires_at=null where id=$1", [guest.id]);
    const claimed = await database.query<{ user_id: string; guest_owner_hash: string | null }>("select user_id,guest_owner_hash from practice_sessions where id=$1", [guest.id]);
    expect(claimed.rows[0]).toEqual({ user_id: "00000000-0000-4000-8000-000000000099", guest_owner_hash: null });
  });

  it("represents Listening Parts 1-4 media groups and internal transcripts", async () => {
    for (const [part, count] of [[1,1],[2,1],[3,3],[4,3]] as const) {
      const groupId = `00000000-0000-4000-800${part}-00000000000${part}`;
      const setType = part === 1 ? "part1" : part === 2 ? "part2" : part === 3 ? "conversation" : "talk";
      await database.query(`insert into passage_sets (id,toeic_part,skill_area,set_type,title) values ('${groupId}',${part},'LISTENING','${setType}','Part ${part}')`);
      const audioId = `10000000-0000-4000-800${part}-00000000000${part}`;
      await database.query(`insert into media_assets (id,kind,access_scope,storage_key,mime_type,byte_size,checksum,status) values ('${audioId}','AUDIO','CONTENT','content/listening/audio/${audioId}.mp3','audio/mpeg',10,'sha','READY')`);
      await database.query(`insert into question_group_media (question_group_id,media_asset_id,role) values ('${groupId}','${audioId}','AUDIO')`);
      if (part === 1 || part === 3 || part === 4) { const imageId = `20000000-0000-4000-800${part}-00000000000${part}`; await database.query(`insert into media_assets (id,kind,access_scope,storage_key,mime_type,byte_size,checksum,status) values ('${imageId}','IMAGE','CONTENT','content/listening/images/${imageId}.webp','image/webp',10,'sha','READY')`); await database.query(`insert into question_group_media (question_group_id,media_asset_id,role) values ('${groupId}','${imageId}','IMAGE')`); }
      await database.query(`insert into listening_transcripts (question_group_id,content) values ('${groupId}','internal transcript')`);
      for (let questionOrder = 1; questionOrder <= count; questionOrder++) await database.query(`insert into questions (toeic_part,skill_area,question_type,response_type,skill,sub_skill,difficulty,question_text,passage_set_id,question_order) values (${part},'LISTENING','multiple_choice','MULTIPLE_CHOICE','listening','comprehension','medium','Question','${groupId}',${questionOrder})`);
      const questions = await database.query(`select id from questions where passage_set_id='${groupId}'`);
      expect(questions.rows).toHaveLength(count);
    }
  });

  it("enforces one active diagnostic per unambiguous owner", async () => {
    await database.query("insert into diagnostic_runs (user_id,expires_at) values ('00000000-0000-4000-8000-000000000099',now()+interval '7 days')");
    await expect(database.query("insert into diagnostic_runs (user_id,expires_at) values ('00000000-0000-4000-8000-000000000099',now()+interval '7 days')")).rejects.toThrow();
    await expect(database.query("insert into diagnostic_runs (expires_at) values (now()+interval '7 days')")).rejects.toThrow();
  });
});
