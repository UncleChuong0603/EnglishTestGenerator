import { createHash } from "node:crypto";

import { countIds, createPool, upsertRows } from "./lib/seed-pg.mjs";

import { part5Questions } from "./part5-seed-data.mjs";
import { formatDistribution, validatePart5Questions } from "./validate-part5-seed.mjs";

const SOURCE = "task_2_development_seed";

function stableUuid(value) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((Number.parseInt(hex[16], 16) & 3) | 8).toString(16);
  const compact = hex.join("");
  return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
}

function buildRows() {
  const questionRows = [];
  const optionRows = [];
  const solutionRows = [];

  for (const question of part5Questions) {
    const questionId = stableUuid(`part5-question:${question.key}`);
    const options = question.options.map((option, index) => ({
      id: stableUuid(`part5-option:${question.key}:${option.key}`),
      question_id: questionId,
      option_key: option.key,
      option_text: option.text,
      display_order: index + 1,
    }));
    questionRows.push({
      id: questionId,
      toeic_part: question.toeicPart,
      question_type: question.questionType,
      skill: question.skill,
      sub_skill: question.subSkill,
      difficulty: question.difficulty,
      question_text: question.text,
      passage_id: null,
      audio_url: null,
      image_url: null,
      metadata: { seed_key: question.key, source: SOURCE, content_kind: "original_development" },
      status: question.status,
    });
    optionRows.push(...options);
    solutionRows.push({
      question_id: questionId,
      correct_option_id: options.find((option) => option.option_key === question.answer).id,
      explanation_en: question.explanationEn,
      explanation_vi: question.explanationVi,
    });
  }
  return { questionRows, optionRows, solutionRows };
}

async function verifyDatabase(client, rows) {
  const ids = rows.questionRows.map(({ id }) => id);
  const questions = await countIds(client, "questions", ids); const optionCount = await countIds(client, "question_options", rows.optionRows.map((o) => o.id)); const solutions = await countIds(client, "question_solutions", ids, "question_id");
  if (questions !== rows.questionRows.length) throw new Error(`Expected ${rows.questionRows.length} seeded questions; found ${questions}.`);
  if (optionCount !== rows.optionRows.length) throw new Error(`Expected ${rows.optionRows.length} seeded options; found ${optionCount}.`);
  if (solutions !== rows.solutionRows.length) throw new Error(`Expected ${rows.solutionRows.length} solutions; found ${solutions}.`);
  console.log(`Database verification passed: ${questions} questions, ${optionCount} options, ${solutions} solutions.`);
}

async function run() {
  const validation = validatePart5Questions();
  if (validation.errors.length > 0) throw new Error(validation.errors.join("\n"));
  console.log(`Local validation passed.\n\n${formatDistribution(validation.report)}\n`);

  const rows = buildRows();
  const pool = createPool(); const client = await pool.connect();
  if (process.argv.includes("--verify-only")) {
    await verifyDatabase(client, rows); client.release(); await pool.end();
    return;
  }
  await client.query("begin"); await upsertRows(client, "questions", rows.questionRows, "id"); await upsertRows(client, "question_options", rows.optionRows, "id"); await upsertRows(client, "question_solutions", rows.solutionRows, "question_id"); await client.query("commit");
  console.log("Idempotent Part 5 seed upsert completed.");
  await verifyDatabase(client, rows); client.release(); await pool.end();
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
