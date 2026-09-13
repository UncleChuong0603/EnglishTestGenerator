import { createHash } from "node:crypto";
import { countIds, createPool, upsertRows } from "./lib/seed-pg.mjs";

import { part5Questions, readingPassageSets } from "./reading-seed-data.mjs";
import { formatReadingDistribution, validateReadingSeed } from "./validate-reading-seed.mjs";

const SOURCE = "task_5_reading_development_seed";

function stableUuid(value) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((Number.parseInt(hex[16], 16) & 3) | 8).toString(16);
  const compact = hex.join("");
  return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
}

function buildRows() {
  const setRows = [], passageRows = [], questionRows = [], optionRows = [], solutionRows = [];
  const appendQuestion = (q, part, questionId, passageSetId = null, passageId = null, order = 1) => {
    const options = q.options.map((option, index) => ({
      id: stableUuid(part === 5
        ? `part5-option:${q.key}:${option.key}`
        : `reading-option:${questionId}:${option.key}`),
      question_id: questionId, option_key: option.key, option_text: option.text, display_order: index + 1,
    }));
    const answerKey = part === 5 ? q.answer : q.options.find((option) => option.correct)?.key;
    const correct = options.find((option) => option.option_key === answerKey);
    if (!correct) throw new Error(`No correct option while building ${q.key}`);
    questionRows.push({
      id: questionId, toeic_part: part, question_type: q.questionType,
      skill: q.skill, sub_skill: q.subSkill, difficulty: q.difficulty,
      question_text: q.text, passage_id: passageId, passage_set_id: passageSetId,
      question_order: order, audio_url: null, image_url: null,
      metadata: { seed_key: q.key, source: SOURCE, content_kind: "original_development" }, status: q.status,
    });
    optionRows.push(...options);
    solutionRows.push({
      question_id: questionId, correct_option_id: correct.id,
      explanation_en: q.explanationEn, explanation_vi: q.explanationVi,
    });
  };

  for (const q of part5Questions) appendQuestion(q, 5, stableUuid(`part5-question:${q.key}`));

  for (const set of readingPassageSets) {
    const setId = stableUuid(`reading-set:${set.key}`);
    setRows.push({
      id: setId, toeic_part: set.toeicPart, set_type: set.setType, title: set.title,
      metadata: { seed_key: set.key, source: SOURCE, content_kind: "original_development" }, status: set.status,
    });
    const passageIds = new Map();
    for (const passage of set.passages) {
      const passageId = stableUuid(`reading-passage:${set.key}:${passage.key}`);
      passageIds.set(passage.key, passageId);
      passageRows.push({
        id: passageId, toeic_part: set.toeicPart,
        passage_type: set.toeicPart === 6 ? "text_completion" : `${set.setType}_passage`,
        title: passage.title, content: passage.content, audio_url: null, image_url: null,
        passage_set_id: setId, position: passage.position, document_type: passage.documentType,
        metadata: { seed_key: `${set.key}:${passage.key}`, source: SOURCE, content_kind: "original_development" },
        status: set.status,
      });
    }
    for (const q of set.questions) {
      const passageKey = q.passageKey ?? (set.toeicPart === 6 ? set.passages[0].key : null);
      appendQuestion(
        q, set.toeicPart, stableUuid(`reading-question:${set.key}:${q.key}`), setId,
        passageKey ? passageIds.get(passageKey) : null, q.order,
      );
    }
  }
  return { setRows, passageRows, questionRows, optionRows, solutionRows };
}

async function verifyDatabase(client, rows) {
  const counts = {
    sets: await countIds(client, "passage_sets", rows.setRows.map((r) => r.id)), passages: await countIds(client, "passages", rows.passageRows.map((r) => r.id)), questions: await countIds(client, "questions", rows.questionRows.map((r) => r.id)), options: await countIds(client, "question_options", rows.optionRows.map((r) => r.id)), solutions: await countIds(client, "question_solutions", rows.solutionRows.map((r) => r.question_id), "question_id"),
  };
  const expected = {
    sets: rows.setRows.length, passages: rows.passageRows.length, questions: rows.questionRows.length,
    options: rows.optionRows.length, solutions: rows.solutionRows.length,
  };
  for (const key of Object.keys(expected)) if (counts[key] !== expected[key]) throw new Error(`Database ${key}: expected ${expected[key]}, found ${counts[key]}.`);

  console.log(`Database verification passed: ${counts.questions} questions, ${counts.options} options, ${counts.passages} passages, and ${counts.sets} passage sets.`);
}

async function run() {
  const validation = validateReadingSeed();
  if (validation.errors.length) throw new Error(validation.errors.join("\n"));
  console.log(`Local validation passed.\n\n${formatReadingDistribution(validation.report)}\n`);
  const rows = buildRows();
  const pool = createPool(); const client = await pool.connect();
  if (!process.argv.includes("--verify-only")) {
    await client.query("begin"); await upsertRows(client, "passage_sets", rows.setRows, "id"); await upsertRows(client, "passages", rows.passageRows, "id"); await upsertRows(client, "questions", rows.questionRows, "id"); await upsertRows(client, "question_options", rows.optionRows, "id"); await upsertRows(client, "question_solutions", rows.solutionRows, "question_id"); await client.query("commit");
    console.log("Idempotent Reading seed upsert completed.");
  }
  await verifyDatabase(client, rows); client.release(); await pool.end();
}

run().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
