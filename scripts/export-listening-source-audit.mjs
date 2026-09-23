import { writeFile } from "node:fs/promises";
import { productionListening } from "./content-manifest.mjs";

const rows = productionListening.flatMap((item) => (item.questions ?? [item.question]).map((question) => ({
  externalId: `${item.externalId}-Q${question.order}`,
  setTitle: item.externalId,
  transcript: item.transcript,
  options: question.options.map((option) => option.text),
})));
const target = process.argv[2];
if (!target) throw new Error("Output JSON path is required");
await writeFile(target, JSON.stringify(rows));
console.log(`Wrote ${rows.length} Listening source questions.`);
