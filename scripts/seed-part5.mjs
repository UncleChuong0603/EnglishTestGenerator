import { createHash } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

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

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) in .env.local before seeding.",
    );
  }
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function assertNoError(operation, result) {
  if (result.error) throw new Error(`${operation} failed: ${result.error.message}`);
  return result.data ?? [];
}

async function verifyDatabase(supabase, rows) {
  const ids = rows.questionRows.map(({ id }) => id);
  const questions = await assertNoError(
    "Question verification",
    await supabase.from("questions").select("id,status,toeic_part,skill,sub_skill,difficulty,question_options(id)").in("id", ids),
  );
  const solutions = await assertNoError(
    "Solution verification",
    await supabase.from("question_solutions").select("question_id,correct_option_id,explanation_en,explanation_vi").in("question_id", ids),
  );
  const learnerSample = await assertNoError(
    "Published-query verification",
    await supabase
      .from("questions")
      .select("id,question_text,skill,sub_skill,difficulty,options:question_options(id,option_key,option_text,display_order)")
      .eq("toeic_part", 5)
      .eq("status", "published")
      .in("id", ids)
      .order("created_at")
      .order("display_order", { referencedTable: "question_options" })
      .limit(10),
  );

  const optionCount = questions.reduce((total, question) => total + question.question_options.length, 0);
  const missingBilingual = solutions.filter(
    (solution) => !solution.explanation_en?.trim() || !solution.explanation_vi?.trim(),
  );
  if (questions.length !== rows.questionRows.length) throw new Error(`Expected ${rows.questionRows.length} seeded questions; found ${questions.length}.`);
  if (optionCount !== rows.optionRows.length) throw new Error(`Expected ${rows.optionRows.length} seeded options; found ${optionCount}.`);
  if (solutions.length !== rows.solutionRows.length) throw new Error(`Expected ${rows.solutionRows.length} solutions; found ${solutions.length}.`);
  if (missingBilingual.length > 0) throw new Error(`${missingBilingual.length} solutions lack bilingual explanations.`);
  if (learnerSample.length !== 10 || learnerSample.some((question) => question.options.length !== 4)) {
    throw new Error("Published Part 5 learner-safe query did not return ten complete questions.");
  }
  console.log(`Database verification passed: ${questions.length} questions, ${optionCount} options, ${solutions.length} solutions, and a 10-question learner-safe sample.`);
}

async function run() {
  const validation = validatePart5Questions();
  if (validation.errors.length > 0) throw new Error(validation.errors.join("\n"));
  console.log(`Local validation passed.\n\n${formatDistribution(validation.report)}\n`);

  const rows = buildRows();
  const supabase = getAdminClient();
  if (process.argv.includes("--verify-only")) {
    await verifyDatabase(supabase, rows);
    return;
  }

  await assertNoError("Question upsert", await supabase.from("questions").upsert(rows.questionRows, { onConflict: "id" }));
  await assertNoError("Option upsert", await supabase.from("question_options").upsert(rows.optionRows, { onConflict: "id" }));
  await assertNoError("Solution upsert", await supabase.from("question_solutions").upsert(rows.solutionRows, { onConflict: "question_id" }));
  console.log("Idempotent Part 5 seed upsert completed.");
  await verifyDatabase(supabase, rows);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
