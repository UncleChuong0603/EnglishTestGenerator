import { productionListening } from "./content-manifest.mjs";
import { part5Questions, readingPassageSets } from "./reading-seed-data.mjs";

const normalize = (value) => String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const groups = new Map();
const add = (part, questionId, options, correctKey) => {
  for (const option of options) {
    if ((option.correct ?? option.key === correctKey)) continue;
    const key = normalize(option.text);
    const list = groups.get(key) ?? [];
    list.push({ part, questionId });
    groups.set(key, list);
  }
};
for (const item of productionListening) for (const question of item.questions ?? [item.question]) add(item.part, `${item.externalId}:Q${question.order}`, question.options, question.correctKey);
for (const question of part5Questions) add(5, question.key, question.options, question.answer);
for (const set of readingPassageSets) for (const question of set.questions) add(set.toeicPart, `${set.key}:${question.key}`, question.options);
const repeats = [...groups.entries()].filter(([, list]) => list.length > 1);
console.log(`Repeated wrong option texts: ${repeats.length}; extra occurrences: ${repeats.reduce((sum, [, list]) => sum + list.length - 1, 0)}`);
console.log(`By part: ${JSON.stringify(Object.fromEntries([1,2,3,4,5,6,7].map((part) => [part, repeats.flatMap(([, list]) => list).filter((item) => item.part === part).length])))}`);
console.log(`Most repeated: ${JSON.stringify(repeats.sort((a,b) => b[1].length - a[1].length).slice(0,15).map(([text,list]) => [text,list.length]))}`);
if (process.argv.includes("--strict") && repeats.length) process.exitCode = 1;
