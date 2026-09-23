import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const normalize = (value) => String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const argument = (name) => process.argv.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const sourcePath = argument("--source");
const planPath = argument("--plan-output");
const mediaDir = argument("--media-dir");
if (!sourcePath || !process.env.DATABASE_URL) throw new Error("--source=JSON and DATABASE_URL are required");
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

function audioDurationMs(body) {
  let offset = 0;
  if (body.length >= 10 && body[0] === 0x49 && body[1] === 0x44 && body[2] === 0x33) offset = 10 + ((body[6] & 127) << 21) + ((body[7] & 127) << 14) + ((body[8] & 127) << 7) + (body[9] & 127);
  const mpeg1 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320];
  const mpeg2 = [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160];
  for (let i = offset; i + 4 <= body.length; i++) {
    if (body[i] !== 255 || (body[i + 1] & 224) !== 224) continue;
    const version = (body[i + 1] >> 3) & 3;
    const layer = (body[i + 1] >> 1) & 3;
    const index = (body[i + 2] >> 4) & 15;
    if (version === 1 || layer !== 1 || index < 1 || index > 14) continue;
    return Math.round((body.length - i) * 8 / (version === 3 ? mpeg1[index] : mpeg2[index]));
  }
  throw new Error("MP3 has no readable frame");
}

const client = await pool.connect();
try {
  await client.query("begin");
  await client.query("select pg_advisory_xact_lock(hashtextextended('sync-listening-option-bank',0))");
  const { rows: questions } = await client.query(`select q.id, q.toeic_part, q.passage_set_id,
      q.metadata->>'external_id' as external_id, s.correct_option_id
      from full_mock_form_questions f join questions q on q.id=f.question_id
      join question_solutions s on s.question_id=q.id where f.part between 1 and 4`);
  const { rows: options } = await client.query(`select q.id as question_id, o.id, o.option_key, o.option_text
      from full_mock_form_questions f join questions q on q.id=f.question_id
      join question_options o on o.question_id=q.id where f.part between 1 and 4`);
  const { rows: sets } = await client.query(`select distinct ps.id, ps.title, lt.content
      from full_mock_form_questions f join questions q on q.id=f.question_id
      join passage_sets ps on ps.id=q.passage_set_id
      join listening_transcripts lt on lt.question_group_id=ps.id
      where f.part between 1 and 4`);
  const { rows: assets } = await client.query(`select distinct ps.title, gm.role, a.id, a.checksum, a.storage_key
      from full_mock_form_questions f join questions q on q.id=f.question_id
      join passage_sets ps on ps.id=q.passage_set_id
      join question_group_media gm on gm.question_group_id=ps.id
      join media_assets a on a.id=gm.media_asset_id
      where f.part between 1 and 4`);
  if (questions.length !== 2500 || sets.length !== 1350) throw new Error(`Unexpected Listening bank: ${questions.length} questions, ${sets.length} sets`);
  const byExternal = new Map(questions.map((row) => [row.external_id, row]));
  const optionsByQuestion = new Map();
  for (const row of options) optionsByQuestion.set(row.question_id, [...(optionsByQuestion.get(row.question_id) ?? []), row]);
  const setsByTitle = new Map(sets.map((row) => [row.title, row]));
  const assetsByTitleRole = new Map(assets.map((row) => [`${row.title}:${row.role}`, row]));
  const updates = [];
  const solutions = [];
  const transcripts = [];
  const audioGroups = [];
  let changedQuestions = 0;
  for (const item of source) {
    const set = setsByTitle.get(item.externalId);
    if (!set) throw new Error(`Missing Listening set ${item.externalId}`);
    if (normalize(set.content) !== normalize(item.transcript)) {
      if (item.part >= 3) throw new Error(`Conversation or talk transcript changed without regenerated audio: ${item.externalId}`);
      transcripts.push({ id: set.id, content: item.transcript });
    }
    let changed = false;
    for (const question of item.questions) {
      const actual = byExternal.get(question.externalId);
      if (!actual || actual.passage_set_id !== set.id || actual.toeic_part !== item.part) throw new Error(`Missing or mismatched Listening question ${question.externalId}`);
      const current = optionsByQuestion.get(actual.id) ?? [];
      if (current.length !== question.options.length) throw new Error(`Wrong option count: ${question.externalId}`);
      const next = question.options.map((option) => {
        const previous = current.find((row) => row.option_key === option.key);
        if (!previous) throw new Error(`Missing option ${question.externalId}:${option.key}`);
        if (normalize(previous.option_text) !== normalize(option.text)) changed = true;
        return { id: previous.id, questionId: actual.id, text: option.text, key: option.key };
      });
      const expectedCorrect = next.find((option) => option.key === question.correctKey)?.id;
      if (!expectedCorrect) throw new Error(`Missing correct key in ${question.externalId}`);
      if (expectedCorrect !== actual.correct_option_id) solutions.push({ questionId: actual.id, correctId: expectedCorrect });
      if (next.some((option) => normalize(current.find((row) => row.id === option.id).option_text) !== normalize(option.text))) changedQuestions++;
      updates.push(...next);
    }
    if (item.part === 1) {
      const image = assetsByTitleRole.get(`${item.externalId}:IMAGE`);
      if (!image || image.checksum !== item.imageChecksum) throw new Error(`Part 1 image differs from authored source: ${item.externalId}`);
    }
    if (item.part <= 2 && (changed || transcripts.some((row) => row.id === set.id))) {
      const audio = assetsByTitleRole.get(`${item.externalId}:AUDIO`);
      if (!audio) throw new Error(`Missing audio asset: ${item.externalId}`);
      audioGroups.push({ externalId: item.externalId, assetId: audio.id });
    }
  }
  const wrong = new Map();
  const correctByQuestion = new Map(questions.map((q) => [q.id, solutions.find((s) => s.questionId === q.id)?.correctId ?? q.correct_option_id]));
  for (const option of updates) {
    if (option.id === correctByQuestion.get(option.questionId)) continue;
    const key = normalize(option.text);
    if (wrong.has(key)) throw new Error(`Repeated wrong Listening option: ${key}`);
    wrong.set(key, option.questionId);
  }
  const plan = { audioGroups, changedQuestions, transcripts: transcripts.length, solutions: solutions.length };
  if (planPath) await writeFile(planPath, JSON.stringify(plan));
  console.log(`Prepared ${updates.length} Listening choices; ${changedQuestions} changed questions; ${transcripts.length} transcripts; ${audioGroups.length} new audio files; ${solutions.length} answer keys.`);
  if (process.argv.includes("--dry-run")) {
    await client.query("rollback");
  } else {
    if (audioGroups.length && (!mediaDir || !process.env.LOCAL_MEDIA_ROOT)) throw new Error("--media-dir and LOCAL_MEDIA_ROOT are required to update audio");
    const assetUpdates = [];
    for (const group of audioGroups) {
      const body = await readFile(path.join(mediaDir, `${group.externalId}.mp3`));
      if (!body.length || body.length > 15 * 1024 * 1024) throw new Error(`Invalid audio size: ${group.externalId}`);
      const hash = createHash("sha256").update(body).digest("hex");
      const key = `content/listening/audio/${group.externalId}-${hash.slice(0, 12)}.mp3`;
      const target = path.resolve(process.env.LOCAL_MEDIA_ROOT, key);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, body);
      assetUpdates.push({ id: group.assetId, key, checksum: hash, bytes: body.length, duration: audioDurationMs(body) });
    }
    for (let offset = 0; offset < updates.length; offset += 1000) {
      const batch = updates.slice(offset, offset + 1000);
      const result = await client.query(`update question_options o set option_text=x.text
        from jsonb_to_recordset($1::jsonb) as x(id uuid,text text) where o.id=x.id`, [JSON.stringify(batch)]);
      if (result.rowCount !== batch.length) throw new Error(`Only synchronized ${result.rowCount}/${batch.length} Listening options`);
    }
    if (transcripts.length) await client.query(`update listening_transcripts t set content=x.content
      from jsonb_to_recordset($1::jsonb) as x(id uuid,content text) where t.question_group_id=x.id`, [JSON.stringify(transcripts)]);
    if (solutions.length) await client.query(`update question_solutions s set correct_option_id=x.correct_id
      from jsonb_to_recordset($1::jsonb) as x(question_id uuid,correct_id uuid) where s.question_id=x.question_id`, [JSON.stringify(solutions.map((row) => ({ question_id: row.questionId, correct_id: row.correctId })))]);
    if (assetUpdates.length) await client.query(`update media_assets a set storage_key=x.key, checksum=x.checksum,
      byte_size=x.bytes, audio_duration_ms=x.duration, updated_at=now()
      from jsonb_to_recordset($1::jsonb) as x(id uuid,key text,checksum text,bytes int,duration int) where a.id=x.id`, [JSON.stringify(assetUpdates)]);
    await client.query("commit");
    console.log(`Synchronized Listening question bank and ${assetUpdates.length} versioned audio files.`);
  }
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}
