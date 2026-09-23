import { fileURLToPath } from "node:url";

import { productionListening } from "./content-manifest.mjs";
import { part5Questions, readingPassageSets } from "./reading-seed-data.mjs";

const normalize = (value) => String(value ?? "").normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
const take = (pool, count, label) => {
  if (pool.length < count) throw new Error(`${label}: need ${count} more groups; only ${pool.length} remain`);
  return pool.splice(0, count);
};
const takeBySize = (pool, size, count, label) => {
  const selected = [];
  for (let index = 0; index < pool.length && selected.length < count;) {
    if (pool[index].questionIds.length === size) selected.push(...pool.splice(index, 1));
    else index++;
  }
  if (selected.length !== count) throw new Error(`${label}: need ${count} groups of ${size}; found ${selected.length}`);
  return selected;
};

/** The authored bank is divided into exactly 25 disjoint, canonical 200-question forms. */
export function planFullMockForms({ listening = productionListening, part5 = part5Questions, sets = readingPassageSets } = {}) {
  const pools = new Map();
  for (const part of [1, 2, 3, 4, 5, 6, "7-single", "7-multiple"]) pools.set(part, []);
  const signatures = new Map();
  const distractorTexts = new Map();
  const ids = new Set();
  const append = (pool, unit) => {
    if (ids.has(unit.id)) throw new Error(`Duplicate content unit: ${unit.id}`);
    ids.add(unit.id);
    for (const question of unit.questions) {
      if (!question.text?.trim() || !question.correct?.trim()) throw new Error(`Missing question or answer: ${unit.id}`);
      const signature = [normalize(unit.context), normalize(question.text), normalize(question.correct)].join("|");
      const prior = signatures.get(signature);
      if (prior) throw new Error(`Duplicate context, question and answer: ${prior} / ${unit.id}`);
      signatures.set(signature, unit.id);
      const choices = question.options.map(normalize);
      if (choices.some((choice) => !choice) || new Set(choices).size !== choices.length) throw new Error(`Duplicate or empty options: ${unit.id}`);
      for (const choice of choices) {
        if (choice === normalize(question.correct)) continue;
        const previous = distractorTexts.get(choice);
        if (previous) throw new Error(`Repeated wrong option ${JSON.stringify(choice)}: ${previous} / ${unit.id}`);
        distractorTexts.set(choice, unit.id);
      }
    }
    pools.get(pool).push(unit);
  };
  for (const item of listening) {
    const questions = item.questions ?? [item.question];
    append(item.part, {
      id: `L:${item.externalId}`, part: item.part, questionIds: questions.map((q) => `${item.externalId}-Q${q.order}`),
      context: item.transcript, questions: questions.map((q) => ({ text: q.text, correct: q.options.find((o) => o.key === q.correctKey)?.text, options: q.options.map((o) => o.text) })),
    });
  }
  for (const item of part5) append(5, {
    id: `R:${item.key}`, part: 5, questionIds: [item.key], context: item.text,
    questions: [{ text: item.text, correct: item.options.find((o) => o.key === item.answer)?.text, options: item.options.map((o) => o.text) }],
  });
  for (const set of sets) append(set.toeicPart === 6 ? 6 : set.setType === "single" ? "7-single" : "7-multiple", {
    id: `R:${set.key}`, part: set.toeicPart, setType: set.setType, questionIds: set.questions.map((q) => `${set.key}:${q.key}`),
    context: set.passages.map((p) => p.content).join("\n"),
    questions: set.questions.map((q) => ({ text: q.text, correct: q.options.find((o) => o.correct)?.text, options: q.options.map((o) => o.text) })),
  });

  const forms = [];
  for (let index = 0; index < 25; index++) {
    const byPart = {
      1: take(pools.get(1), 6, "Part 1"),
      2: take(pools.get(2), 25, "Part 2"),
      3: take(pools.get(3), 13, "Part 3"),
      4: take(pools.get(4), 10, "Part 4"),
      5: take(pools.get(5), 30, "Part 5"),
      6: take(pools.get(6), 4, "Part 6"),
    };
    // Existing 10-form inventory has 30 two-, 50 three-, and 20 four-question
    // single passages. The 15 new forms use one two- and nine three-question sets.
    byPart[7] = index < 10
      ? [...takeBySize(pools.get("7-single"), 2, 3, "Part 7 single"), ...takeBySize(pools.get("7-single"), 3, 5, "Part 7 single"), ...takeBySize(pools.get("7-single"), 4, 2, "Part 7 single")]
      : [...takeBySize(pools.get("7-single"), 2, 1, "Part 7 single"), ...takeBySize(pools.get("7-single"), 3, 9, "Part 7 single")];
    byPart[7].push(...(index < 5
      ? [...takeBySize(pools.get("7-multiple"), 4, 1, "Part 7 multiple"), ...takeBySize(pools.get("7-multiple"), 5, 3, "Part 7 multiple"), ...takeBySize(pools.get("7-multiple"), 6, 1, "Part 7 multiple")]
      : takeBySize(pools.get("7-multiple"), 5, 5, "Part 7 multiple")));
    const counts = Object.fromEntries(Object.entries(byPart).map(([part, units]) => [part, units.reduce((sum, unit) => sum + unit.questionIds.length, 0)]));
    const expected = { 1: 6, 2: 25, 3: 39, 4: 30, 5: 30, 6: 16, 7: 54 };
    for (const part of Object.keys(expected)) if (counts[part] !== expected[part]) throw new Error(`Form ${index + 1}, Part ${part}: ${counts[part]} questions, expected ${expected[part]}`);
    forms.push({ number: index + 1, byPart, questionIds: Object.values(byPart).flatMap((units) => units.flatMap((unit) => unit.questionIds)) });
  }
  for (const [part, pool] of pools) if (pool.length) throw new Error(`Unused ${part} groups: ${pool.length}`);
  const questionIds = forms.flatMap((form) => form.questionIds);
  if (questionIds.length !== 5000 || new Set(questionIds).size !== 5000) throw new Error(`Expected 5,000 unique question IDs, found ${new Set(questionIds).size} / ${questionIds.length}`);
  return forms;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const forms = planFullMockForms();
    console.log(`Validated ${forms.length} disjoint Full Mock forms, ${forms.reduce((sum, form) => sum + form.questionIds.length, 0)} unique questions.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
