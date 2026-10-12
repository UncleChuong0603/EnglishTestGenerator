/* eslint-disable @typescript-eslint/no-require-imports -- this CommonJS script is piped to `node -` inside the production app container */
// Aggregate-only, read-only content and physical-media audit. It emits no question,
// learner, credential, storage-key or filesystem-path values.
const { createHash } = require("node:crypto");
const { readdir, readFile, realpath, stat } = require("node:fs/promises");
const path = require("node:path");
const { Client } = require("pg");

const targets = {
  MOCK: { 1: 150, 2: 625, 3: 975, 4: 750, 5: 750, 6: 400, 7: 1350 },
  PRACTICE: { 1: 100, 2: 900, 3: 900, 4: 600, 5: 1000, 6: 400, 7: 1100 },
};

async function physicalMedia(rows) {
  const configuredRoot = process.env.LOCAL_MEDIA_ROOT;
  if (!configuredRoot) return { configured: false, readyAssets: rows.length, checkedFiles: 0, missing: rows.length, unsafe: 0, sizeMismatch: 0, checksumMismatch: 0, metadataMismatch: 0, orphans: 0, referencedPass: false, clean: false };
  const root = await realpath(configuredRoot);
  const known = new Set(rows.map((row) => row.storage_key));
  const result = { configured: true, readyAssets: rows.length, checkedFiles: 0, missing: 0, unsafe: 0, sizeMismatch: 0, checksumMismatch: 0, metadataMismatch: 0, orphans: 0, referencedPass: false, clean: false };
  for (const row of rows) {
    const target = path.resolve(root, row.storage_key || "");
    if (!row.storage_key || row.storage_key.includes("\\") || row.storage_key.split("/").includes("..") || !target.startsWith(`${root}${path.sep}`)) { result.unsafe++; continue; }
    try {
      const actual = await realpath(target);
      if (!actual.startsWith(`${root}${path.sep}`)) { result.unsafe++; continue; }
      const info = await stat(actual);
      if (!info.isFile()) { result.metadataMismatch++; continue; }
      const body = await readFile(actual);
      result.checkedFiles++;
      if (info.size !== Number(row.byte_size)) result.sizeMismatch++;
      if (createHash("sha256").update(body).digest("hex") !== row.checksum) result.checksumMismatch++;
      if (!(["audio/mpeg", "image/jpeg", "image/png", "image/webp"].includes(row.mime_type))) result.metadataMismatch++;
    } catch (error) {
      if (error && error.code === "ENOENT") result.missing++;
      else result.metadataMismatch++;
    }
  }
  async function walk(directory, prefix = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const key = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path.join(directory, entry.name), key);
      else if (entry.isFile() && !entry.name.endsWith(".tmp") && !known.has(key)) result.orphans++;
      else if (entry.isSymbolicLink()) result.unsafe++;
    }
  }
  await walk(root);
  result.referencedPass = result.checkedFiles === rows.length && result.missing + result.unsafe + result.sizeMismatch + result.checksumMismatch + result.metadataMismatch === 0;
  result.clean = result.referencedPass && result.orphans === 0;
  return result;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_REQUIRED");
  const client = new Client({ connectionString: process.env.DATABASE_URL, statement_timeout: 60_000 });
  await client.connect();
  let mediaRows = [];
  try {
    await client.query("begin read only");
    const [inventory, quality, groupStructure, listeningMedia, passageStructure, mockMapping, provenance, imports, unreviewedPublished, governance, longContent, media] = [
      await client.query(`select bank_pool,toeic_part,count(*)::int questions,count(distinct passage_set_id)::int groups
        from questions where status='published' group by 1,2 order by 1,2`),
      await client.query(`select q.bank_pool,q.toeic_part,count(*)::int questions,
          count(*) filter(where s.question_id is null)::int missing_solution,
          count(*) filter(where nullif(trim(s.explanation_en),'') is null)::int missing_en,
          count(*) filter(where nullif(trim(s.explanation_vi),'') is null)::int missing_vi,
          count(*) filter(where choices.n <> case when q.toeic_part=2 then 3 else 4 end)::int wrong_option_count,
          count(*) filter(where answer.id is null)::int invalid_answer_key
        from questions q
        left join question_solutions s on s.question_id=q.id
        left join question_options answer on answer.id=s.correct_option_id and answer.question_id=q.id
        left join lateral(select count(*)::int n from question_options o where o.question_id=q.id) choices on true
        where q.status='published' group by 1,2 order by 1,2`),
      await client.query(`select count(*)::int bad from (
          select g.id,min(q.toeic_part)::int part,count(distinct q.toeic_part)::int parts,
            count(distinct q.bank_pool)::int pools,count(*)::int questions
          from passage_sets g join questions q on q.passage_set_id=g.id
          where q.status='published' group by g.id
        ) x where parts<>1 or pools<>1 or (part in (1,2) and questions<>1)
          or (part in (3,4) and questions<>3) or (part=6 and questions<>4)`),
      await client.query(`select q.bank_pool,q.toeic_part,count(distinct q.passage_set_id)::int groups,
          count(distinct q.passage_set_id) filter(where not exists(
            select 1 from question_group_media gm join media_assets ma on ma.id=gm.media_asset_id
            where gm.question_group_id=q.passage_set_id and gm.role='AUDIO' and ma.kind='AUDIO' and ma.status='READY'
              and ma.byte_size>0 and ma.audio_duration_ms>0))::int missing_audio,
          count(distinct q.passage_set_id) filter(where q.toeic_part=1 and not exists(
            select 1 from question_group_media gm join media_assets ma on ma.id=gm.media_asset_id
            where gm.question_group_id=q.passage_set_id and gm.role='IMAGE' and ma.kind='IMAGE' and ma.status='READY'
              and ma.byte_size>0 and ma.image_width>0 and ma.image_height>0))::int missing_image,
          count(distinct q.passage_set_id) filter(where not exists(
            select 1 from listening_transcripts t where t.question_group_id=q.passage_set_id and nullif(trim(t.content),'') is not null))::int missing_transcript
        from questions q where q.status='published' and q.toeic_part between 1 and 4
        group by 1,2 order by 1,2`),
      await client.query(`select count(*)::int bad from (
          select g.id,g.toeic_part,g.set_type,g.status,count(distinct p.id)::int documents,
            bool_and(coalesce(p.status='published',false)) documents_published
          from passage_sets g join questions q on q.passage_set_id=g.id
          left join passages p on p.passage_set_id=g.id
          where q.status='published' and q.toeic_part in (6,7)
          group by g.id
        ) x where status<>'published' or not documents_published
          or (toeic_part=6 and documents<>1)
          or (toeic_part=7 and documents<>case set_type when 'single' then 1 when 'double' then 2 when 'triple' then 3 else -1 end)`),
      await client.query(`select count(*)::int mapped,count(distinct f.question_id)::int unique_questions,
          count(distinct f.form_number)::int forms,
          count(*) filter(where q.status<>'published' or q.bank_pool<>'MOCK')::int invalid
        from full_mock_form_questions f join questions q on q.id=f.question_id`),
      await client.query(`select provenance,bank_pool,toeic_part,count(*)::int questions from questions
        where status='published' group by 1,2,3 order by 1,2,3`),
      await client.query(`select source_type,review_status,status,count(*)::int batches,
          coalesce(sum(item_count),0)::int items,coalesce(sum(question_count),0)::int questions
        from question_import_batches group by 1,2,3 order by 1,2,3`),
      await client.query(`select q.bank_pool,q.toeic_part,count(*)::int questions
        from question_import_batches b
        join question_import_items i on i.import_batch_id=b.id
        join questions q on q.passage_set_id=i.question_group_id
        where b.review_status='UNREVIEWED' and b.status='COMMITTED' and q.status='published'
        group by 1,2 order by 1,2`),
      await client.query(`select
          (select count(*)::int from question_reports where status in ('OPEN','IN_REVIEW')) learner_open,
          (select count(*)::int from question_issue_reports where status in ('OPEN','IN_REVIEW')) qa_open,
          (select count(*)::int from question_duplicate_scans) duplicate_scan_parts,
          (select coalesce(sum(scanned_count),0)::int from question_duplicate_scans) duplicate_scanned,
          (select coalesce(sum(detected_count),0)::int from question_duplicate_scans) duplicate_detected`),
      await client.query(`select coalesce(max(char_length(p.content)),0)::int max_passage_chars,
          coalesce(max(d.documents),0)::int max_documents_per_group
        from passages p cross join lateral(
          select count(*)::int documents from passages p2 where p2.passage_set_id=p.passage_set_id
        ) d where p.status='published'`),
      await client.query(`select storage_key,byte_size,checksum,mime_type from media_assets
        where storage_provider='LOCAL' and status='READY'`),
    ];
    mediaRows = media.rows;
    const issues = [];
    const warnings = [];
    const inventoryMap = new Map(inventory.rows.map((row) => [`${row.bank_pool}:${row.toeic_part}`, Number(row.questions)]));
    for (const [pool, parts] of Object.entries(targets)) for (const [part, target] of Object.entries(parts)) {
      const actual = inventoryMap.get(`${pool}:${part}`) ?? 0;
      if (actual !== target) issues.push(`${pool} Part ${part}: ${actual}/${target}`);
    }
    for (const row of quality.rows) for (const field of ["missing_solution", "missing_en", "missing_vi", "wrong_option_count", "invalid_answer_key"]) if (Number(row[field])) issues.push(`${row.bank_pool} Part ${row.toeic_part} ${field}: ${row[field]}`);
    if (Number(groupStructure.rows[0].bad)) issues.push(`invalid grouped structure: ${groupStructure.rows[0].bad}`);
    if (Number(passageStructure.rows[0].bad)) issues.push(`invalid passage structure: ${passageStructure.rows[0].bad}`);
    for (const row of listeningMedia.rows) for (const field of ["missing_audio", "missing_image", "missing_transcript"]) if (Number(row[field])) issues.push(`${row.bank_pool} Part ${row.toeic_part} ${field}: ${row[field]}`);
    const mapping = mockMapping.rows[0];
    if (Number(mapping.mapped) !== 5000 || Number(mapping.unique_questions) !== 5000 || Number(mapping.forms) !== 25 || Number(mapping.invalid)) issues.push("full mock mapping incomplete");
    const unreviewedCount = unreviewedPublished.rows.reduce((sum, row) => sum + Number(row.questions), 0);
    if (unreviewedCount) issues.push(`published questions from unreviewed imports: ${unreviewedCount}`);
    await client.query("rollback");
    const physical = await physicalMedia(mediaRows);
    if (!physical.referencedPass) issues.push("referenced physical media verification failed");
    if (physical.orphans) warnings.push(`orphan media files: ${physical.orphans}`);
    if (Number(governance.rows[0].duplicate_scan_parts) < 7) warnings.push(`duplicate scans cover ${governance.rows[0].duplicate_scan_parts}/7 parts`);
    console.log(JSON.stringify({
      inventory: inventory.rows,
      quality: quality.rows,
      groupStructure: groupStructure.rows[0],
      listeningMedia: listeningMedia.rows,
      passageStructure: passageStructure.rows[0],
      fullMock: mapping,
      provenance: provenance.rows,
      imports: imports.rows,
      unreviewedPublished: unreviewedPublished.rows,
      governance: governance.rows[0],
      longContent: longContent.rows[0],
      physicalMedia: physical,
      issues,
      warnings,
      ready: issues.length === 0,
    }, null, 2));
    if (issues.length) process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch(() => {
  console.error("TASK58_PRODUCTION_AUDIT_FAILED");
  process.exitCode = 1;
});
