import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
}, 60_000);
afterAll(async () => database.close());

describe("listening lesson isolation", () => {
  it("has no question bank or scoring foreign keys", async () => {
    const fks = await database.query<{ foreign_table_name: string }>(`select c.confrelid::regclass::text as foreign_table_name from pg_constraint c where c.conrelid = 'listening_lessons'::regclass and c.contype = 'f'`);
    expect(fks.rows).toHaveLength(0);
  });

  it("rejects reusing a published lesson transcript or audio in the question bank", async () => {
    await database.exec(`insert into listening_lessons (title, toeic_part, transcript, transcript_fingerprint, audio_storage_key, audio_checksum, status) values ('Office', 3, 'The office opens at nine.', 'fingerprint1', 'study/listening/audio/a.mp3', 'audio1', 'PUBLISHED')`);
    await database.exec(`insert into passage_sets (toeic_part, skill_area, set_type, title) values (3, 'LISTENING', 'conversation', 'Bank set')`);
    const set = await database.query<{ id: string }>(`select id from passage_sets where title = 'Bank set'`);
    const setId = set.rows[0].id;
    await expect(database.exec(`insert into listening_transcripts (question_group_id, content) values ('${setId}', ' THE  OFFICE\nOPENS AT NINE. ')`)).rejects.toThrow("LISTENING_LESSON_CONTENT_REUSED_IN_QUESTION_BANK");
    await database.exec(`insert into media_assets (kind, access_scope, storage_key, mime_type, byte_size, checksum, status) values ('AUDIO', 'CONTENT', 'content/listening/audio/b.mp3', 'audio/mpeg', 100, 'audio1', 'READY')`);
    const asset = await database.query<{ id: string }>(`select id from media_assets where checksum = 'audio1'`);
    await expect(database.exec(`insert into question_group_media (question_group_id, media_asset_id, role) values ('${setId}', '${asset.rows[0].id}', 'AUDIO')`)).rejects.toThrow("LISTENING_LESSON_AUDIO_REUSED_IN_QUESTION_BANK");
    await database.exec(`insert into passages (toeic_part, passage_type, passage_set_id) values (3, 'conversation', '${setId}')`);
    const passage = await database.query<{ id: string }>(`select id from passages where passage_set_id = '${setId}'`);
    await expect(database.exec(`insert into stimulus_media (stimulus_id, media_asset_id, role) values ('${passage.rows[0].id}', '${asset.rows[0].id}', 'AUDIO')`)).rejects.toThrow("LISTENING_LESSON_AUDIO_REUSED_IN_QUESTION_BANK");
  });
});
