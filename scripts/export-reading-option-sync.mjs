import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { part5Questions, readingPassageSets } from "./reading-seed-data.mjs";

function stableUuid(value) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((Number.parseInt(hex[16], 16) & 3) | 8).toString(16);
  const id = hex.join("");
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

const questions = part5Questions.map((question) => ({
  id: stableUuid(`part5-question:${question.key}`),
  text: question.text,
  options: question.options.map((option) => ({ key: option.key, text: option.text })),
}));
const passages = [];
for (const set of readingPassageSets) {
  for (const passage of set.passages) passages.push({ id: stableUuid(`reading-passage:${set.key}:${passage.key}`), part: set.toeicPart, content: passage.content });
  for (const question of set.questions) questions.push({
    id: stableUuid(`reading-question:${set.key}:${question.key}`),
    options: question.options.map((option) => ({ key: option.key, text: option.text })),
  });
}
const output = process.argv[2];
if (!output) throw new Error("Output JSON path is required");
await writeFile(output, JSON.stringify({ questions, passages }));
console.log(`Exported ${questions.length} questions and ${passages.length} passages.`);
