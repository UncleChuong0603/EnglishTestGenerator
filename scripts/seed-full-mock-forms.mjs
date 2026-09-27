import { createHash } from "node:crypto";
import pg from "pg";

import { planFullMockForms } from "./plan-full-mock-forms.mjs";

function stableUuid(value) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((Number.parseInt(hex[16], 16) & 3) | 8).toString(16);
  const id = hex.join("");
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

function questionUuid(unit, index) {
  if (unit.id.startsWith("L:")) return stableUuid(`task12-question:${unit.id.slice(2)}:${index + 1}`);
  if (unit.part === 5) return stableUuid(`part5-question:${unit.id.slice(2)}`);
  return stableUuid(`reading-question:${unit.id.slice(2)}:${unit.questionIds[index].split(":").at(-1)}`);
}

export function plannedRows() {
  const rows = planFullMockForms().flatMap((form) => {
    let position = 0;
    return Object.values(form.byPart).flatMap((units) => units.flatMap((unit) =>
      unit.questionIds.map((_, index) => ({ form_number: form.number, position: ++position, part: unit.part, question_id: questionUuid(unit, index) }))));
  });
  if (rows.length !== 5000 || new Set(rows.map((row) => row.question_id)).size !== 5000) throw new Error("Form mapping must contain 5,000 distinct questions");
  return rows;
}

async function verifySource(client, rows) {
  const query = `
    select q.id, q.toeic_part, q.status, q.passage_set_id, ps.status as set_status,
      count(distinct o.id)::int as option_count, count(distinct s.question_id)::int as solution_count
    from questions q
    left join passage_sets ps on ps.id=q.passage_set_id
    left join question_options o on o.question_id=q.id
    left join question_solutions s on s.question_id=q.id
    where q.id=any($1::uuid[])
    group by q.id,ps.status`;
  let result = await client.query(query, [rows.map((row) => row.question_id)]);
  let byId = new Map(result.rows.map((row) => [row.id, row]));
  if (result.rows.length !== rows.length) {
    const missing = rows.filter((row) => !byId.has(row.question_id));
    if (missing.some((row) => row.part !== 5)) throw new Error(`Database is missing ${missing.length} mapped non-Part-5 questions`);
    const extras = await client.query(`select id from questions where toeic_part=5 and status='published' and id<>all($1::uuid[]) order by id`, [rows.map((row) => row.question_id)]);
    if (extras.rows.length !== missing.length) throw new Error(`Expected ${missing.length} existing imported Part 5 replacements; found ${extras.rows.length}`);
    missing.forEach((row, index) => { row.question_id = extras.rows[index].id; });
    result = await client.query(query, [rows.map((row) => row.question_id)]);
    byId = new Map(result.rows.map((row) => [row.id, row]));
    if (result.rows.length !== rows.length) throw new Error("Imported Part 5 replacements did not resolve the mapped bank");
    console.log(`Reconciled ${missing.length} existing published Part 5 imports into the 25-form plan.`);
  }
  for (const row of rows) {
    const actual = byId.get(row.question_id);
    if (actual.toeic_part !== row.part || actual.status !== "published" || (row.part !== 5 && actual.set_status !== "published") || actual.option_count !== (row.part === 2 ? 3 : 4) || actual.solution_count !== 1) throw new Error(`Question is not eligible: ${row.question_id}`);
  }
  const duplicatePart5 = await client.query(`select lower(trim(q.question_text)) as stem, lower(trim(o.option_text)) as answer, count(*)::int as copies
    from questions q join question_solutions s on s.question_id=q.id join question_options o on o.id=s.correct_option_id
    where q.id=any($1::uuid[]) and q.toeic_part=5
    group by 1,2 having count(*)>1 limit 1`, [rows.map((row) => row.question_id)]);
  if (duplicatePart5.rows.length) throw new Error(`Repeated Part 5 question and correct answer: ${duplicatePart5.rows[0].stem}`);
  const listeningIds = [...new Set(result.rows.filter((row) => row.toeic_part <= 4).map((row) => row.passage_set_id))];
  const media = await client.query(`
    select qgm.question_group_id, qgm.role from question_group_media qgm
    join media_assets ma on ma.id=qgm.media_asset_id
    where qgm.question_group_id=any($1::uuid[]) and ma.status='READY' and ma.access_scope='CONTENT'`, [listeningIds]);
  const mediaBySet = new Map();
  for (const row of media.rows) mediaBySet.set(row.question_group_id, new Set([...(mediaBySet.get(row.question_group_id) ?? []), row.role]));
  for (const row of result.rows.filter((item) => item.toeic_part <= 4)) {
    const roles = mediaBySet.get(row.passage_set_id) ?? new Set();
    if (!roles.has("AUDIO") || (row.toeic_part === 1 && !roles.has("IMAGE"))) throw new Error(`Listening media is not ready: ${row.passage_set_id}`);
  }
}

async function run() {
  const rows = plannedRows();
  if (process.argv.includes("--dry-run")) {
    console.log(`Validated ${rows.length} distinct question assignments across 25 full tests.`);
    return;
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock(hashtextextended('full-mock-25-form-seed',0))");
    await verifySource(client, rows);
    if (!process.argv.includes("--verify-only")) {
      await client.query("update questions set bank_pool='MOCK' where id=any($1::uuid[])", [rows.map((row) => row.question_id)]);
      await client.query("delete from full_mock_form_questions");
      for (let offset = 0; offset < rows.length; offset += 500) {
        const batch = rows.slice(offset, offset + 500);
        await client.query(`insert into full_mock_form_questions(form_number,position,part,question_id)
          select * from unnest($1::smallint[],$2::smallint[],$3::smallint[],$4::uuid[])`,
        [batch.map((row) => row.form_number), batch.map((row) => row.position), batch.map((row) => row.part), batch.map((row) => row.question_id)]);
      }
    }
    const pools = await client.query("select count(*) filter (where bank_pool <> 'MOCK')::int as invalid from questions where id=any($1::uuid[])", [rows.map((row) => row.question_id)]);
    if (pools.rows[0].invalid) throw new Error(`${pools.rows[0].invalid} mapped questions are outside the MOCK pool`);
    const actual = await client.query(`select form_number,position,part,question_id from full_mock_form_questions order by form_number,position`);
    if (actual.rows.length !== rows.length || actual.rows.some((row, index) => row.form_number !== rows[index].form_number || row.position !== rows[index].position || row.part !== rows[index].part || row.question_id !== rows[index].question_id)) throw new Error("Stored form assignments differ from the source plan");
    await client.query("commit");
    console.log(`Verified 25 disjoint Full Mock forms and ${rows.length} published, answerable questions with ready Listening media.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
