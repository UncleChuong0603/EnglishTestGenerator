import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { productionListening } from "./content-manifest.mjs";

const items = await Promise.all(productionListening.map(async (item) => ({
  externalId: item.externalId,
  part: item.part,
  transcript: item.transcript,
  imageChecksum: item.part === 1 ? createHash("sha256").update(await readFile(item.media.find((asset) => asset.role === "IMAGE").assetRef)).digest("hex") : null,
  questions: (item.questions ?? [item.question]).map((question) => ({
    externalId: `${item.externalId}-Q${question.order}`,
    correctKey: question.correctKey,
    options: question.options,
  })),
})));
const output = process.argv[2];
if (!output) throw new Error("Output JSON path is required");
await writeFile(output, JSON.stringify(items));
console.log(`Exported ${items.length} Listening groups and ${items.reduce((sum, item) => sum + item.questions.length, 0)} questions.`);
