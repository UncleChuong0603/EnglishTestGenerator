/* eslint-disable @typescript-eslint/no-require-imports -- production operator script */
const { Client } = require("pg");

const mode = process.env.MODE || "unreviewed-p5";
const offset = Math.max(0, Number(process.env.OFFSET) || 0);
const limit = Math.min(2000, Math.max(1, Number(process.env.LIMIT) || 25));
const compact = process.env.COMPACT === "1";
const part = Number(process.env.PART) || null;
const minConfidence = Math.min(100, Math.max(0, Number(process.env.MIN_CONFIDENCE) || 0));
const exactOnly = process.env.EXACT_ONLY === "1";

function printCompact(rows) {
  for (const [index, row] of rows.entries()) {
    console.log(`\n[${offset + index + 1}] ${row.group_id} | P${row.toeic_part} ${row.bank_pool} ${row.difficulty} ${row.skill}/${row.sub_skill}`);
    if (row.transcript) console.log(`TRANSCRIPT: ${row.transcript}`);
    for (const passage of row.passages ?? []) console.log(`PASSAGE ${passage.position}: ${passage.content}`);
    console.log(`Q: ${row.question_text}`);
    console.log((row.options ?? []).map((option) => `${option.key}${option.correct ? "*" : ""}: ${option.text}`).join("\n"));
    console.log(`EN: ${row.explanation_en}`);
    console.log(`VI: ${row.explanation_vi}`);
  }
}

function printDuplicateCompact(rows) {
  for (const [index, row] of rows.entries()) {
    console.log(`\n[${offset + index + 1}] ${row.report_id} | P${row.toeic_part} confidence=${row.confidence_percent}% exact=${row.evidence?.exact === true}`);
    console.log(`LEFT ${row.left_group_id}: ${row.left_title}`);
    if (row.left_passages) console.log(`LEFT PASSAGE: ${row.left_passages}`);
    if (row.left_transcript) console.log(`LEFT TRANSCRIPT: ${row.left_transcript}`);
    console.log(`LEFT QUESTIONS: ${row.left_questions}`);
    console.log(`RIGHT ${row.right_group_id}: ${row.right_title}`);
    if (row.right_passages) console.log(`RIGHT PASSAGE: ${row.right_passages}`);
    if (row.right_transcript) console.log(`RIGHT TRANSCRIPT: ${row.right_transcript}`);
    console.log(`RIGHT QUESTIONS: ${row.right_questions}`);
  }
}

const contentProjection = `
  select g.id as group_id,g.title,g.toeic_part,g.set_type,g.status as group_status,
    q.id as question_id,q.question_order,q.question_text,q.bank_pool,q.difficulty,q.skill,q.sub_skill,
    s.explanation_en,s.explanation_vi,
    coalesce((select json_agg(json_build_object('key',o.option_key,'text',o.option_text,'correct',o.id=s.correct_option_id) order by o.display_order)
      from question_options o where o.question_id=q.id),'[]'::json) options,
    coalesce((select json_agg(json_build_object('position',p.position,'type',p.document_type,'title',p.title,'content',p.content) order by p.position)
      from passages p where p.passage_set_id=g.id),'[]'::json) passages,
    (select t.content from listening_transcripts t where t.question_group_id=g.id limit 1) transcript
  from passage_sets g join questions q on q.passage_set_id=g.id
  join question_solutions s on s.question_id=q.id`;

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_REQUIRED");
  const client = new Client({ connectionString: process.env.DATABASE_URL, statement_timeout: 120_000 });
  await client.connect();
  try {
    await client.query("begin read only");
    let result;
    if (mode === "unreviewed-p5") {
      result = await client.query(`${contentProjection}
        join question_import_items i on i.question_group_id=g.id
        join question_import_batches b on b.id=i.import_batch_id
        where b.source_type='AI_ASSISTED_ORIGINAL' and b.review_status='UNREVIEWED' and b.status='COMMITTED'
          and q.status='published' and q.toeic_part=5 and q.bank_pool='MOCK'
        order by b.batch_key,i.external_item_id,q.question_order,q.id offset $1 limit $2`, [offset, limit]);
      const batches = await client.query(`select b.batch_key,b.name,b.rights_note,b.item_count,b.question_count,b.review_status,
          count(q.id)::int published_mock_p5
        from question_import_batches b join question_import_items i on i.import_batch_id=b.id
        join questions q on q.passage_set_id=i.question_group_id
        where b.source_type='AI_ASSISTED_ORIGINAL' and b.review_status='UNREVIEWED' and b.status='COMMITTED'
          and q.status='published' and q.toeic_part=5 and q.bank_pool='MOCK'
        group by b.id order by b.batch_key`);
      if (compact) {
        console.log(JSON.stringify({ mode, offset, limit, batches: batches.rows }));
        printCompact(result.rows);
      } else console.log(JSON.stringify({ mode, offset, limit, batches: batches.rows, rows: result.rows }, null, 2));
    } else if (mode === "sample") {
      result = await client.query(`with ranked as (
          select g.id,row_number() over(partition by g.toeic_part,q.bank_pool,q.difficulty order by md5(g.id::text)) rn
          from passage_sets g join questions q on q.passage_set_id=g.id
          where g.status='published' and q.status='published' and ($1::int is null or g.toeic_part=$1)
          group by g.id,g.toeic_part,q.bank_pool,q.difficulty
        ), sample_groups as (select distinct id from ranked where rn<=1)
        ${contentProjection}
        join sample_groups sg on sg.id=g.id
        where q.status='published'
        order by g.toeic_part,q.bank_pool,q.difficulty,g.id,q.question_order`, [part]);
      if (compact) printCompact(result.rows);
      else console.log(JSON.stringify({ mode, rows: result.rows }, null, 2));
    } else if (mode === "duplicate-summary") {
      result = await client.query(`select toeic_part,
          count(*)::int total,
          count(*) filter (where evidence->>'exact'='true')::int exact,
          count(*) filter (where confidence_percent=100)::int confidence_100,
          count(*) filter (where confidence_percent>=95)::int confidence_ge_95,
          count(*) filter (where confidence_percent>=90)::int confidence_ge_90,
          count(*) filter (where confidence_percent>=80)::int confidence_ge_80,
          count(*) filter (where confidence_percent>=70)::int confidence_ge_70,
          min(confidence_percent)::int min_confidence,
          max(confidence_percent)::int max_confidence
        from question_issue_reports
        where source='SYSTEM' and issue_type='DUPLICATE' and status in ('OPEN','IN_REVIEW')
        group by toeic_part order by toeic_part`);
      console.log(JSON.stringify({ mode, rows: result.rows }, null, 2));
    } else if (mode === "duplicates") {
      result = await client.query(`select r.id as report_id,r.toeic_part,r.status,r.confidence_percent,r.evidence,
          l.id as left_group_id,l.title as left_title,l.status as left_status,
          rgt.id as right_group_id,rgt.title as right_title,rgt.status as right_status,
          (select string_agg(coalesce(p.content,''),' ' order by p.position) from passages p where p.passage_set_id=l.id) left_passages,
          (select t.content from listening_transcripts t where t.question_group_id=l.id limit 1) left_transcript,
          (select string_agg(concat_ws(' ',q.question_text,(select string_agg(o.option_text,' ' order by o.display_order) from question_options o where o.question_id=q.id)),' ' order by q.question_order) from questions q where q.passage_set_id=l.id) left_questions,
          (select string_agg(coalesce(p.content,''),' ' order by p.position) from passages p where p.passage_set_id=rgt.id) right_passages,
          (select t.content from listening_transcripts t where t.question_group_id=rgt.id limit 1) right_transcript,
          (select string_agg(concat_ws(' ',q.question_text,(select string_agg(o.option_text,' ' order by o.display_order) from question_options o where o.question_id=q.id)),' ' order by q.question_order) from questions q where q.passage_set_id=rgt.id) right_questions
        from question_issue_reports r join passage_sets l on l.id=r.primary_group_id
        join passage_sets rgt on rgt.id=r.related_group_id
        where r.source='SYSTEM' and r.issue_type='DUPLICATE' and r.status in ('OPEN','IN_REVIEW')
          and ($3::int is null or r.toeic_part=$3)
          and r.confidence_percent >= $4
          and ($5::boolean=false or r.evidence->>'exact'='true')
        order by r.toeic_part,r.confidence_percent desc,r.id offset $1 limit $2`,
        [offset, limit, part, minConfidence, exactOnly]);
      const counts = await client.query(`select toeic_part,status,count(*)::int reports
        from question_issue_reports where source='SYSTEM' and issue_type='DUPLICATE'
        group by toeic_part,status order by toeic_part,status`);
      if (compact) {
        console.log(JSON.stringify({ mode, offset, limit, part, minConfidence, exactOnly, counts: counts.rows }));
        printDuplicateCompact(result.rows);
      } else console.log(JSON.stringify({ mode, offset, limit, part, minConfidence, exactOnly, counts: counts.rows, rows: result.rows }, null, 2));
    } else throw new Error("INVALID_MODE");
    await client.query("rollback");
  } finally { await client.end(); }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "TASK59_CONTENT_EXPORT_FAILED");
  process.exitCode = 1;
});
