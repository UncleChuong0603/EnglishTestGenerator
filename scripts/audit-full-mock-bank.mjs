import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const normalize = (value) => String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const problems = [];
const report = (message) => { if (problems.length < 30) problems.push(message); };

if (!process.env.DATABASE_URL || !process.env.LOCAL_MEDIA_ROOT) {
  throw new Error("DATABASE_URL and LOCAL_MEDIA_ROOT are required");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
try {
  const root = await realpath(process.env.LOCAL_MEDIA_ROOT);
  const [{ rows: questions }, { rows: options }, { rows: media }, { rows: transcripts }] = await Promise.all([
    pool.query(`select f.form_number, f.part, q.id, q.passage_set_id, q.status,
      q.skill_area, q.response_type, q.question_order, q.question_text,
      q.metadata->>'external_id' as external_id, ps.title as set_title,
      ps.status as set_status, ps.set_type, lt.content as transcript,
      (select count(*)::int from passages p where p.passage_set_id=ps.id and p.status='published') as passage_count,
      s.correct_option_id, s.explanation_en, s.explanation_vi
      from full_mock_form_questions f
      join questions q on q.id=f.question_id
      left join passage_sets ps on ps.id=q.passage_set_id
      left join listening_transcripts lt on lt.question_group_id=ps.id
      left join question_solutions s on s.question_id=q.id
      order by f.form_number,f.position`),
    pool.query(`select f.question_id, o.id, o.option_key, o.option_text,
      o.display_order,
      s.correct_option_id
      from full_mock_form_questions f
      join question_options o on o.question_id=f.question_id
      left join question_solutions s on s.question_id=f.question_id`),
    pool.query(`select distinct q.passage_set_id, q.toeic_part, gm.role,
      a.id, a.kind, a.access_scope, a.storage_provider, a.storage_key,
      a.mime_type, a.byte_size, a.checksum, a.status, a.audio_duration_ms,
      a.image_width, a.image_height
      from full_mock_form_questions f
      join questions q on q.id=f.question_id
      left join question_group_media gm on gm.question_group_id=q.passage_set_id
      left join media_assets a on a.id=gm.media_asset_id
      where q.toeic_part between 1 and 4`),
    pool.query(`select distinct ps.title, lt.content
      from full_mock_form_questions f
      join questions q on q.id=f.question_id
      join passage_sets ps on ps.id=q.passage_set_id
      left join listening_transcripts lt on lt.question_group_id=ps.id
      where q.toeic_part between 1 and 4`),
  ]);

  const forms = new Set(questions.map((row) => row.form_number));
  const ids = new Set(questions.map((row) => row.id));
  if (questions.length !== 5000 || ids.size !== 5000 || forms.size !== 25) report(`Bank size: ${questions.length} rows, ${ids.size} IDs, ${forms.size} forms`);
  const { rows: publishedCounts } = await pool.query(`select count(*)::int as total,
    count(*) filter (where f.question_id is null)::int as unmapped
    from questions q left join full_mock_form_questions f on f.question_id=q.id
    where q.status='published'`);
  console.log(`Published question bank: ${publishedCounts[0].total}; outside 25 forms: ${publishedCounts[0].unmapped}`);
  if (publishedCounts[0].total !== 5000 || publishedCounts[0].unmapped !== 0) report("Published question bank differs from the 5,000 mapped questions");

  const optionsByQuestion = new Map();
  const partByQuestion = new Map(questions.map((question) => [question.id, question.part]));
  const bankOptionTexts = new Map();
  const distractors = new Map();
  for (const option of options) {
    const list = optionsByQuestion.get(option.question_id) ?? [];
    list.push(option);
    optionsByQuestion.set(option.question_id, list);
    const key = normalize(option.option_text);
    bankOptionTexts.set(key, (bankOptionTexts.get(key) ?? 0) + 1);
    if (option.id !== option.correct_option_id) {
      const list = distractors.get(key) ?? [];
      list.push({ id: option.id, questionId: option.question_id, part: partByQuestion.get(option.question_id), text: option.option_text });
      distractors.set(key, list);
    }
  }
  const repeatedDistractors = [...distractors.entries()].filter(([, list]) => list.length > 1);
  for (const [text, list] of repeatedDistractors.slice(0, 15)) report(`Repeated wrong option ${JSON.stringify(text)} in ${list.map((item) => item.questionId).join(", ")}`);
  const sourcePath = process.argv.find((arg) => arg.startsWith("--source="))?.slice(9);
  if (sourcePath) {
    const source = JSON.parse(await readFile(sourcePath, "utf8"));
    const actualByExternalId = new Map(questions.filter((question) => question.part <= 4).map((question) => [question.external_id, question]));
    const transcriptByTitle = new Map(transcripts.map((row) => [row.title, row.content]));
    const optionMismatches = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const transcriptMismatches = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const missing = [];
    const examples = [];
    for (const expected of source) {
      const actual = actualByExternalId.get(expected.externalId);
      if (!actual) { missing.push(expected.externalId); continue; }
      const choices = (optionsByQuestion.get(actual.id) ?? []).sort((a, b) => a.display_order - b.display_order).map((option) => normalize(option.option_text));
      if (JSON.stringify(choices) !== JSON.stringify(expected.options.map(normalize))) {
        optionMismatches[actual.part]++;
        if (examples.length < 5) examples.push({ id: expected.externalId, expected: expected.options, actual: (optionsByQuestion.get(actual.id) ?? []).map((option) => option.option_text) });
      }
      if (normalize(transcriptByTitle.get(actual.set_title)) !== normalize(expected.transcript)) transcriptMismatches[actual.part]++;
    }
    console.log(`Source comparison: ${source.length} questions; missing IDs: ${missing.length}; option mismatches by part: ${JSON.stringify(optionMismatches)}; transcript mismatches by part: ${JSON.stringify(transcriptMismatches)}`);
    console.log(`Listening examples: ${JSON.stringify(examples)}`);
    if (missing.length || Object.values(optionMismatches).some(Boolean) || Object.values(transcriptMismatches).some(Boolean)) report("Live Listening differs from authored source");
  }
  const readingSourcePath = process.argv.find((arg) => arg.startsWith("--reading-source="))?.slice(17);
  if (readingSourcePath) {
    const readingSource = JSON.parse(await readFile(readingSourcePath, "utf8"));
    const authored = new Map(readingSource.questions.map((question) => [question.id, question]));
    let mismatched = 0;
    let mismatchedPrompts = 0;
    let imported = 0;
    for (const question of questions.filter((item) => item.part >= 5)) {
      const expected = authored.get(question.id);
      if (!expected) {
        imported++;
        if (question.part !== 5 || !question.question_text.startsWith("Choose the best completed sentence: ")) mismatchedPrompts++;
        continue;
      }
      const actual = new Map((optionsByQuestion.get(question.id) ?? []).map((option) => [option.option_key, normalize(option.option_text)]));
      if (expected.options.some((option) => actual.get(option.key) !== normalize(option.text))) mismatched++;
      if (question.part === 5 && normalize(question.question_text) !== normalize(expected.text)) mismatchedPrompts++;
    }
    const { rows: passageRows } = await pool.query(`select id,content from passages where toeic_part=6 and status='published'`);
    const passageContent = new Map(passageRows.map((row) => [row.id, normalize(row.content)]));
    const mismatchedPassages = readingSource.passages.filter((passage) => passage.part === 6 && passageContent.get(passage.id) !== normalize(passage.content)).length;
    console.log(`Reading source comparison: ${mismatched} option mismatches, ${mismatchedPrompts} Part 5 prompt mismatches, ${mismatchedPassages} passage mismatches, ${imported} existing Part 5 imports`);
    if (mismatched || mismatchedPrompts || mismatchedPassages || imported !== 100) report("Live Reading differs from authored source or imported Part 5 count changed");
  }
  for (const question of questions) {
    const choices = optionsByQuestion.get(question.id) ?? [];
    const texts = choices.map((choice) => normalize(choice.option_text));
    const keys = choices.map((choice) => choice.option_key);
    const expected = question.part === 2 ? 3 : 4;
    if (question.status !== "published") report(`${question.id}: unpublished`);
    if (choices.length !== expected || texts.some((text) => !text) || new Set(texts).size !== choices.length || new Set(keys).size !== choices.length) {
      report(`${question.id}: ${choices.length} choices; duplicate or empty option text/key`);
    }
    if (!choices.some((choice) => choice.id === question.correct_option_id)) report(`${question.id}: answer key is missing or points elsewhere`);
    if (question.part <= 4 && !question.passage_set_id) report(`${question.id}: no Listening group`);
    const expectedPassages = question.part === 6 ? 1 : question.set_type === "single" ? 1 : question.set_type === "double" ? 2 : question.set_type === "triple" ? 3 : 0;
    const practiceEligible = question.status === "published" && question.response_type === "MULTIPLE_CHOICE" &&
      (question.explanation_en?.trim() || question.explanation_vi?.trim()) &&
      (question.part === 5 || question.set_status === "published") &&
      (question.part >= 5 || question.skill_area === "LISTENING" && question.transcript?.trim()) &&
      (question.part <= 5 || question.passage_count === expectedPassages);
    if (!practiceEligible) report(`${question.id}: ordinary practice eligibility metadata is incomplete`);
  }

  const groups = new Map();
  const assets = new Map();
  for (const row of media) {
    const group = groups.get(row.passage_set_id) ?? { part: row.toeic_part, audio: [], images: [] };
    if (row.role === "AUDIO") group.audio.push(row);
    if (row.role === "IMAGE") group.images.push(row);
    groups.set(row.passage_set_id, group);
    if (row.id) assets.set(row.id, row);
  }
  for (const [id, group] of groups) {
    if (group.audio.length !== 1) report(`${id}: expected one audio asset, found ${group.audio.length}`);
    if (group.part === 1 && group.images.length !== 1) report(`${id}: expected one Part 1 image, found ${group.images.length}`);
  }
  let audioFiles = 0;
  let imageFiles = 0;
  for (const asset of assets.values()) {
    if (asset.status !== "READY" || asset.access_scope !== "CONTENT" || asset.storage_provider !== "LOCAL" || asset.kind !== asset.role) {
      report(`${asset.id}: media metadata is not ready or role/kind differs`);
    }
    if (!asset.storage_key || path.isAbsolute(asset.storage_key) || asset.storage_key.includes("\\") || asset.storage_key.split("/").includes("..")) {
      report(`${asset.id}: unsafe storage key`);
      continue;
    }
    const filePath = path.resolve(root, asset.storage_key);
    if (!filePath.startsWith(root + path.sep)) { report(`${asset.id}: storage path escaped root`); continue; }
    try {
      const actual = await realpath(filePath);
      if (!actual.startsWith(root + path.sep)) { report(`${asset.id}: media symlink escaped root`); continue; }
      const bytes = await readFile(actual);
      if (bytes.length !== asset.byte_size || createHash("sha256").update(bytes).digest("hex") !== asset.checksum) report(`${asset.id}: file size or SHA-256 differs`);
      if (asset.kind === "AUDIO") {
        audioFiles++;
        if (asset.mime_type !== "audio/mpeg" || !((bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0))) report(`${asset.id}: invalid MP3 header or MIME`);
      } else {
        imageFiles++;
        const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
        const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
        if (!png && !jpeg && !webp) report(`${asset.id}: invalid image signature`);
      }
    } catch (error) {
      report(`${asset.id}: unreadable file (${error.code ?? error.message})`);
    }
  }

  console.log(`Questions: ${questions.length}; forms: ${forms.size}; options: ${options.length}`);
  console.log(`Listening questions: ${questions.filter((row) => row.part <= 4).length}; groups: ${groups.size}`);
  console.log(`Verified media files: ${audioFiles} audio, ${imageFiles} images`);
  console.log(`Option texts reused across questions: ${[...bankOptionTexts.values()].filter((count) => count > 1).length}`);
  console.log(`Wrong option texts reused: ${repeatedDistractors.length} (${repeatedDistractors.reduce((sum, [, list]) => sum + list.length - 1, 0)} extra occurrences)`);
  console.log(`Repeated wrong options by part: ${JSON.stringify(Object.fromEntries([1,2,3,4,5,6,7].map((part) => [part, repeatedDistractors.flatMap(([, list]) => list).filter((item) => item.part === part).length])))}`);
  console.log(`Most repeated wrong options: ${JSON.stringify(repeatedDistractors.sort((a, b) => b[1].length - a[1].length).slice(0, 12).map(([text, list]) => [text, list.length]))}`);
  console.log(`Problems: ${problems.length}`);
  for (const problem of problems) console.error(problem);
  if (problems.length) process.exitCode = 1;
} finally {
  await pool.end();
}
