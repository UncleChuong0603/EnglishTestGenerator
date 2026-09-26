import { practiceListeningExpansion } from "../content/listening/practice-bank-expansion.mjs";

const seen = new Map();
const duplicates = [];
for (const item of practiceListeningExpansion.filter(value => value.part >= 3)) {
  for (const question of item.questions) {
    const key = question.options.filter(option => option.key !== question.correctKey)
      .map(option => option.text.toLowerCase().trim()).sort().join("|");
    const current = `${item.externalId}/Q${question.order}`;
    if (seen.has(key)) duplicates.push(`${seen.get(key)} : ${current}`);
    else seen.set(key, current);
  }
}
console.log(`Repeated distractor sets: ${duplicates.length}`);
console.log(`First instances: ${[...new Set(duplicates.map(value => value.split(" : ")[0]))].join(", ")}`);
console.log(duplicates.slice(0, 100).join("\n"));
if (duplicates.length) process.exitCode = 1;
