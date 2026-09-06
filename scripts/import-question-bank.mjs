import fs from "node:fs/promises";

const allowedDifficulties = new Set(["B1", "B2", "C1"]);
const allowedSkills = new Set(["vocabulary", "main_idea", "detail", "inference", "reference"]);
const allowedKeys = ["A", "B", "C", "D"];

function validateBank(bank) {
  if (!bank || !Array.isArray(bank.passages)) throw new Error("Seed must contain a passages array.");
  for (const passage of bank.passages) {
    if (!passage.id || !passage.title || !passage.content || !passage.topic || !allowedDifficulties.has(passage.difficulty) || !Array.isArray(passage.questions)) throw new Error(`Invalid passage: ${passage.id ?? "unknown"}`);
    for (const question of passage.questions) {
      if (question.difficulty !== passage.difficulty || question.topic !== passage.topic) throw new Error(`Question ${question.id ?? "unknown"} must match its passage difficulty and topic.`);
      const keys = question.options?.map((option) => option.key);
      if (!question.id || !question.question || !question.explanation || !allowedSkills.has(question.skill) || !allowedDifficulties.has(question.difficulty) || keys?.length !== 4 || !allowedKeys.every((key) => keys.includes(key)) || !allowedKeys.includes(question.correctAnswer)) throw new Error(`Invalid question: ${question.id ?? "unknown"}`);
    }
  }
}

const bank = JSON.parse(await fs.readFile(new URL("../supabase/seed/question-bank.json", import.meta.url), "utf8"));
validateBank(bank);

const passageCount = bank.passages.length;
const questionCount = bank.passages.reduce(
  (total, passage) => total + passage.questions.length,
  0,
);

if (process.argv.includes("--validate-only")) {
  console.log(`Validated ${passageCount} passages and ${questionCount} questions.`);
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY before importing.");
const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

for (const passage of bank.passages) {
  const { questions, ...passageRow } = passage;
  const { error: passageError } = await supabase.from("passages").upsert({ ...passageRow, source_label: "VSTEP Practice editorial", is_active: true });
  if (passageError) throw new Error(`Could not import passage ${passage.id}: ${passageError.message}`);
  const rows = questions.map((question) => ({
    id: question.id, passage_id: passage.id, question_order: question.order,
    question: question.question, options: question.options, correct_answer: question.correctAnswer,
    explanation: question.explanation, skill: question.skill, sub_skill: question.subSkill,
    difficulty: question.difficulty, topic: question.topic, is_active: true,
  }));
  const { error: questionError } = await supabase.from("questions").upsert(rows);
  if (questionError) throw new Error(`Could not import questions for ${passage.id}: ${questionError.message}`);
}

console.log(`Imported ${passageCount} passages and ${questionCount} questions.`);
