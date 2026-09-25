import pg from "pg";
import { fileURLToPath } from "node:url";

export const PRACTICE_TARGET_BY_PART = Object.freeze({ 1: 100, 2: 900, 3: 900, 4: 600, 5: 1000, 6: 400, 7: 1100 });
export const MOCK_TARGET_BY_PART = Object.freeze({ 1: 150, 2: 625, 3: 975, 4: 750, 5: 750, 6: 400, 7: 1350 });

export function evaluatePoolCounts(rows) {
  const count = (pool, part) => Number(rows.find((row) => row.bank_pool === pool && Number(row.toeic_part) === part)?.total ?? 0);
  const mock = Object.fromEntries(Object.entries(MOCK_TARGET_BY_PART).map(([part]) => [part, count("MOCK", Number(part))]));
  const practice = Object.fromEntries(Object.entries(PRACTICE_TARGET_BY_PART).map(([part]) => [part, count("PRACTICE", Number(part))]));
  const issues = [];
  for (const [part, target] of Object.entries(MOCK_TARGET_BY_PART)) if (mock[part] !== target) issues.push(`MOCK Part ${part}: ${mock[part]} / ${target}`);
  for (const [part, target] of Object.entries(PRACTICE_TARGET_BY_PART)) if (practice[part] !== target) issues.push(`PRACTICE Part ${part}: ${practice[part]} / ${target}`);
  return { mock, practice, issues };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1, statement_timeout: 30_000 });
  try {
    const [counts, mapping, mixedGroups, incompleteGroups, missingAnswers, missingMedia, invalidPassages, activeMockChallenges] = await Promise.all([
      pool.query("select bank_pool,toeic_part,count(*)::int total from questions where status='published' group by 1,2 order by 1,2"),
      pool.query(`select count(*)::int mapped,
        count(*) filter (where q.bank_pool <> 'MOCK' or q.status <> 'published')::int invalid,
        count(distinct f.question_id)::int unique_questions,
        count(distinct f.form_number)::int forms
        from full_mock_form_questions f join questions q on q.id=f.question_id`),
      pool.query(`select count(*)::int bad from (
        select passage_set_id from questions where passage_set_id is not null and status='published'
        group by passage_set_id having count(distinct bank_pool) > 1
      ) s`),
      pool.query(`select count(*)::int bad from (
        select passage_set_id,toeic_part,count(*)::int n from questions
        where status='published' and bank_pool='PRACTICE' and toeic_part in (3,4,6)
        group by passage_set_id,toeic_part
        having passage_set_id is null or count(*) <> case when toeic_part=6 then 4 else 3 end
      ) s`),
      pool.query(`select count(*)::int bad from questions q
        left join question_solutions s on s.question_id=q.id
        left join lateral (select count(*)::int n from question_options o where o.question_id=q.id) choices on true
        where q.status='published' and q.bank_pool='PRACTICE'
          and (s.question_id is null or nullif(trim(s.explanation_en),'') is null
            or nullif(trim(s.explanation_vi),'') is null
            or not exists(select 1 from question_options answer where answer.id=s.correct_option_id and answer.question_id=q.id)
            or choices.n <> case when q.toeic_part=2 then 3 else 4 end)`),
      pool.query(`select count(*)::int bad from (
        select q.passage_set_id,q.toeic_part,
          bool_or(gm.role='AUDIO' and ma.status='READY') has_audio,
          bool_or(gm.role='IMAGE' and ma.status='READY') has_image,
          bool_or(nullif(trim(t.content),'') is not null) has_transcript
        from questions q
        left join question_group_media gm on gm.question_group_id=q.passage_set_id
        left join media_assets ma on ma.id=gm.media_asset_id
        left join listening_transcripts t on t.question_group_id=q.passage_set_id
        where q.status='published' and q.bank_pool='PRACTICE' and q.toeic_part between 1 and 4
        group by q.passage_set_id,q.toeic_part
      ) s where passage_set_id is null or not coalesce(has_audio,false)
        or not coalesce(has_transcript,false)
        or (toeic_part=1 and not coalesce(has_image,false))`),
      pool.query(`select count(*)::int bad from (
        select q.passage_set_id,q.toeic_part,g.set_type,g.status,
          count(distinct p.id)::int documents,
          bool_and(p.status='published') documents_published
        from questions q
        left join passage_sets g on g.id=q.passage_set_id
        left join passages p on p.passage_set_id=q.passage_set_id
        where q.status='published' and q.bank_pool='PRACTICE'
        group by q.passage_set_id,q.toeic_part,g.set_type,g.status
      ) s where (toeic_part<>5 and passage_set_id is null)
        or (passage_set_id is not null and status<>'published')
        or (toeic_part=7 and (documents <> case set_type when 'single' then 1 when 'double' then 2 when 'triple' then 3 else -1 end
          or not coalesce(documents_published,false)))
        or (toeic_part=6 and (documents<>1 or not coalesce(documents_published,false)))`),
      pool.query(`select count(distinct c.id)::int bad from ranked_challenges c
        join ranked_challenge_items i on i.challenge_id=c.id
        join questions q on q.id=i.question_id
        where c.status='PUBLISHED' and c.ends_at>now() and q.bank_pool='MOCK'`),
    ]);
    const report = evaluatePoolCounts(counts.rows);
    const form = mapping.rows[0];
    if (form.mapped !== 5000 || form.unique_questions !== 5000 || form.forms !== 25 || form.invalid !== 0) report.issues.push(`Mock mapping: ${JSON.stringify(form)}`);
    for (const [name, result] of [["mixed groups", mixedGroups], ["incomplete groups", incompleteGroups], ["missing answers", missingAnswers], ["missing Listening media", missingMedia], ["invalid passages", invalidPassages], ["active challenges using MOCK", activeMockChallenges]]) {
      if (result.rows[0].bad) report.issues.push(`${name}: ${result.rows[0].bad}`);
    }
    console.log(JSON.stringify({ ...report, ready: report.issues.length === 0 }, null, 2));
    if (process.argv.includes("--require-ready") && report.issues.length) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
