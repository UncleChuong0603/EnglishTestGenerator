import { productionListening, practiceListening } from "./content-manifest.mjs";

const normalize = value => String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const seen = new Map();
const duplicates = [];
const byPart = Object.fromEntries([1, 2, 3, 4].map(part => [part, 0]));
const expected = new Map();

for (const [pool, items] of [["MOCK", productionListening], ["PRACTICE", practiceListening]]) {
  for (const item of items) {
    for (const question of item.questions ?? [item.question]) {
      const label = `${pool}:${item.externalId}:Q${question.order}`;
      expected.set(`${item.externalId}-Q${question.order}`, { pool, part: item.part, question });
      const options = question.options.map(option => normalize(option.text));
      if (new Set(options).size !== options.length) throw new Error(`Duplicate choices in ${label}`);
      if (question.options.filter(option => option.key === question.correctKey).length !== 1) throw new Error(`Invalid answer in ${label}`);
      for (const option of question.options) {
        if (option.key === question.correctKey) continue;
        const key = normalize(option.text);
        const previous = seen.get(key);
        if (previous) { duplicates.push({ text: option.text, previous, current: label }); byPart[item.part]++; }
        else seen.set(key, label);
      }
    }
  }
}

console.log(JSON.stringify({ uniqueDistractors: seen.size, repeatedOccurrences: duplicates.length, byPart, samples: duplicates.slice(0, 12) }, null, 2));
if (process.argv.includes("--strict") && duplicates.length) process.exitCode = 1;

if (process.argv.includes("--database")) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1, statement_timeout: 30_000 });
  try {
    const { rows } = await pool.query(`select q.metadata->>'external_id' external_id, q.bank_pool, q.toeic_part,
      o.option_key, o.option_text, (o.id=s.correct_option_id) correct
      from questions q join question_options o on o.question_id=q.id
      left join question_solutions s on s.question_id=q.id
      where q.status='published' and q.toeic_part between 1 and 4`);
    const found = new Set(), databaseSeen = new Set(), issues = [];
    let repeated = 0;
    for (const row of rows) {
      const source = expected.get(row.external_id);
      const choice = source?.question.options.find(option => option.key === row.option_key);
      const id = `${row.external_id}:${row.option_key}`;
      if (found.has(id)) issues.push(`Duplicate option: ${id}`);
      found.add(id);
      if (!source || source.pool !== row.bank_pool || source.part !== row.toeic_part ||
          choice?.text !== row.option_text || row.correct !== (source.question.correctKey === row.option_key)) {
        issues.push(`Source mismatch: ${id}`);
      }
      if (row.correct === false) {
        const key = normalize(row.option_text);
        if (databaseSeen.has(key)) repeated++;
        databaseSeen.add(key);
      }
    }
    for (const [id, source] of expected) for (const option of source.question.options) {
      if (!found.has(`${id}:${option.key}`)) issues.push(`Missing option: ${id}:${option.key}`);
    }
    console.log(JSON.stringify({ database: true, options: rows.length, uniqueDistractors: databaseSeen.size,
      repeatedOccurrences: repeated, sourceMismatchCount: issues.length, issues: issues.slice(0, 12) }, null, 2));
    if (repeated || issues.length) process.exitCode = 1;
  } finally { await pool.end(); }
}
