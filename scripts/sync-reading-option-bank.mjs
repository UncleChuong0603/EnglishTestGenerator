import { readFile } from "node:fs/promises";
import pg from "pg";

const normalize = (value) => String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const sourcePath = process.argv.find((arg) => arg.startsWith("--source="))?.slice(9);
if (!sourcePath || !process.env.DATABASE_URL) throw new Error("--source=JSON and DATABASE_URL are required");
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const byId = new Map(source.questions.map((question) => [question.id, question]));
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const client = await pool.connect();
try {
  await client.query("begin");
  await client.query("select pg_advisory_xact_lock(hashtextextended('sync-reading-option-bank',0))");
  const { rows } = await client.query(`select q.id, q.toeic_part, q.question_text,
    o.id as option_id, o.option_key, o.option_text, s.correct_option_id
    from full_mock_form_questions f
    join questions q on q.id=f.question_id
    join question_options o on o.question_id=q.id
    join question_solutions s on s.question_id=q.id
    where f.part between 5 and 7 order by q.id,o.display_order`);
  const grouped = new Map();
  for (const row of rows) {
    const list = grouped.get(row.id) ?? [];
    list.push(row);
    grouped.set(row.id, list);
  }
  if (grouped.size !== 2500 || rows.length !== 10000) throw new Error(`Expected 2,500 mapped Reading questions and 10,000 choices; found ${grouped.size}/${rows.length}`);
  const update = [];
  const questionTexts = [];
  const wrong = new Map();
  let importedPart5 = 0;
  for (const [questionId, choices] of grouped) {
    const authored = byId.get(questionId);
    let texts;
    if (authored) {
      texts = new Map(authored.options.map((option) => [option.key, option.text]));
      if (choices[0].toeic_part === 5) questionTexts.push({ id: questionId, text: authored.text });
    }
    else {
      if (choices[0].toeic_part !== 5) throw new Error(`Missing authored Reading question ${questionId}`);
      importedPart5++;
      const stem = choices[0].question_text.replace(/^Choose the best completed sentence: /, "");
      if (!stem.includes("_____")) throw new Error(`Imported Part 5 question has no gap: ${questionId}`);
      questionTexts.push({ id: questionId, text: `Choose the best completed sentence: ${stem}` });
      const [prefix, suffix] = stem.split("_____");
      texts = new Map(choices.map((option) => [option.option_key,
        option.option_text.startsWith(prefix) && option.option_text.endsWith(suffix) ? option.option_text : stem.replace("_____", option.option_text)]));
    }
    const next = choices.map((choice) => ({ ...choice, text: texts.get(choice.option_key) }));
    const normalized = next.map((choice) => normalize(choice.text));
    if (normalized.some((text) => !text) || new Set(normalized).size !== 4) throw new Error(`Invalid choices in ${questionId}`);
    for (const choice of next) {
      update.push({ id: choice.option_id, text: choice.text });
      if (choice.option_id === choice.correct_option_id) continue;
      const key = normalize(choice.text);
      const prior = wrong.get(key);
      if (prior) throw new Error(`Repeated wrong choice in Reading: ${key} (${prior}, ${questionId})`);
      wrong.set(key, questionId);
    }
  }
  console.log(`Prepared ${update.length} options in 2,500 published Reading questions, including ${importedPart5} existing imported Part 5 questions.`);
  if (process.argv.includes("--dry-run")) {
    await client.query("rollback");
  } else {
  for (let offset = 0; offset < update.length; offset += 1000) {
    const batch = update.slice(offset, offset + 1000);
    const result = await client.query(`update question_options o set option_text=x.text
      from jsonb_to_recordset($1::jsonb) as x(id uuid,text text) where o.id=x.id`, [JSON.stringify(batch)]);
    if (result.rowCount !== batch.length) throw new Error(`Only updated ${result.rowCount}/${batch.length} options`);
  }
  for (let offset = 0; offset < questionTexts.length; offset += 500) {
    const batch = questionTexts.slice(offset, offset + 500);
    const result = await client.query(`update questions q set question_text=x.text
      from jsonb_to_recordset($1::jsonb) as x(id uuid,text text) where q.id=x.id`, [JSON.stringify(batch)]);
    if (result.rowCount !== batch.length) throw new Error(`Only updated ${result.rowCount}/${batch.length} Part 5 question prompts`);
  }
  const passageRows = source.passages.filter((passage) => passage.part === 6);
  for (let offset = 0; offset < passageRows.length; offset += 100) {
    const batch = passageRows.slice(offset, offset + 100);
    const result = await client.query(`update passages p set content=x.content
      from jsonb_to_recordset($1::jsonb) as x(id uuid,content text) where p.id=x.id`, [JSON.stringify(batch)]);
    if (result.rowCount !== batch.length) throw new Error(`Only updated ${result.rowCount}/${batch.length} Part 6 passages`);
  }
  await client.query("commit");
  console.log(`Synchronized ${update.length} options, ${questionTexts.length} Part 5 prompts and ${passageRows.length} Part 6 passages to the existing question bank.`);
  }
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}
