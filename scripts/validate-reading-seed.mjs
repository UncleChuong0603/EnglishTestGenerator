import { fileURLToPath } from "node:url";

import { part5Questions, readingPassageSets } from "./reading-seed-data.mjs";
import {
  DIFFICULTIES, DOCUMENT_TYPES, OPTION_KEYS, PASSAGE_SET_TYPES, READING_TAXONOMY, STATUSES,
} from "./reading-taxonomy.mjs";

const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");
const increment = (group, key) => { group[key] = (group[key] ?? 0) + 1; };
const sequential = (values) => values.every((value, index) => value === index + 1);

export function validateReadingSeed({ part5 = part5Questions, sets = readingPassageSets } = {}) {
  const errors = [];
  const seenKeys = new Set();
  const seenQuestions = new Set();
  const seenPassages = new Set();
  const report = {
    total: 0, part: {}, skillByPart: { 5: {}, 6: {}, 7: {} },
    difficulty: {}, passageSets: { part6: 0, single: 0, double: 0, triple: 0 },
  };

  const validateQuestion = (q, part, label, expectedOrder) => {
    report.total += 1;
    increment(report.part, part);
    const key = `${part}:${label}`;
    if (!q.key || seenKeys.has(key)) errors.push(`${label}: missing or duplicate deterministic key.`);
    seenKeys.add(key);
    if (!q.text?.trim()) errors.push(`${label}: missing question text.`);
    else {
      const normalized = normalize(q.text);
      if (seenQuestions.has(normalized)) errors.push(`${label}: duplicate normalized question text.`);
      seenQuestions.add(normalized);
    }
    if (!READING_TAXONOMY[part]?.[q.skill]?.includes(q.subSkill)) {
      errors.push(`${label}: invalid canonical taxonomy ${q.skill}/${q.subSkill}.`);
    } else increment(report.skillByPart[part], q.skill);
    if (!DIFFICULTIES.includes(q.difficulty)) errors.push(`${label}: invalid difficulty.`);
    else increment(report.difficulty, q.difficulty);
    if (!STATUSES.includes(q.status)) errors.push(`${label}: invalid status.`);
    if (expectedOrder !== undefined && q.order !== expectedOrder) errors.push(`${label}: invalid question order.`);
    if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${label}: expected exactly four options.`);
    else {
      const keys = q.options.map((o) => o.key);
      const texts = q.options.map((o) => normalize(o.text ?? ""));
      if (keys.some((key) => !OPTION_KEYS.includes(key)) || new Set(keys).size !== 4) errors.push(`${label}: invalid option keys.`);
      if (texts.some((text) => !text) || new Set(texts).size !== 4) errors.push(`${label}: empty or duplicate option text.`);
      const correctCount = part === 5
        ? q.options.filter((o) => o.key === q.answer).length
        : q.options.filter((o) => o.correct).length;
      if (correctCount !== 1) errors.push(`${label}: expected exactly one correct answer.`);
    }
    if (!q.explanationEn?.trim()) errors.push(`${label}: missing English explanation.`);
    if (!q.explanationVi?.trim()) errors.push(`${label}: missing Vietnamese explanation.`);
  };

  part5.forEach((q, index) => {
    const label = q.key || `Part 5 record ${index + 1}`;
    if (q.toeicPart !== 5 || q.questionType !== "incomplete_sentence") errors.push(`${label}: invalid Part 5 shape.`);
    validateQuestion(q, 5, label);
  });

  for (const set of sets) {
    const label = set.key ?? "passage set";
    if (!PASSAGE_SET_TYPES[set.toeicPart]?.includes(set.setType)) errors.push(`${label}: invalid set type for part.`);
    if (!STATUSES.includes(set.status)) errors.push(`${label}: invalid set status.`);
    if (seenKeys.has(`set:${set.key}`)) errors.push(`${label}: duplicate set key.`);
    seenKeys.add(`set:${set.key}`);
    increment(report.passageSets, set.setType);
    const expectedPassages = set.setType === "double" ? 2 : set.setType === "triple" ? 3 : 1;
    if (set.passages?.length !== expectedPassages) errors.push(`${label}: expected ${expectedPassages} passage(s).`);
    const positions = (set.passages ?? []).map((p) => p.position).sort((a, b) => a - b);
    if (!sequential(positions) || new Set(positions).size !== positions.length) errors.push(`${label}: passage positions must be unique and sequential.`);
    const passageKeys = new Set();
    for (const passage of set.passages ?? []) {
      if (!passage.key || passageKeys.has(passage.key)) errors.push(`${label}: duplicate or missing passage key.`);
      passageKeys.add(passage.key);
      if (!DOCUMENT_TYPES.includes(passage.documentType)) errors.push(`${label}/${passage.key}: invalid document type.`);
      if (!passage.content?.trim() || passage.content.trim().length < 100) errors.push(`${label}/${passage.key}: passage is too short.`);
      else {
        const normalized = normalize(passage.content);
        if (seenPassages.has(normalized)) errors.push(`${label}/${passage.key}: duplicate normalized passage.`);
        seenPassages.add(normalized);
      }
    }
    const orders = (set.questions ?? []).map((q) => q.order).sort((a, b) => a - b);
    if (!sequential(orders) || new Set(orders).size !== orders.length) errors.push(`${label}: question orders must be unique and sequential.`);
    if (set.toeicPart === 6 && (set.questions.length < 3 || set.questions.length > 5)) errors.push(`${label}: Part 6 set question count is not sensible.`);
    for (const [index, q] of (set.questions ?? []).entries()) {
      if (q.passageKey && !passageKeys.has(q.passageKey)) errors.push(`${label}/${q.key}: invalid passage reference.`);
      validateQuestion(q, set.toeicPart, `${label}/${q.key}`, index + 1);
    }
  }

  if (report.part[5] < 200 || report.part[5] > 300) errors.push(`Part 5 count out of target: ${report.part[5]}.`);
  if (report.part[6] < 80 || report.part[6] > 120) errors.push(`Part 6 count out of target: ${report.part[6]}.`);
  if (report.part[7] < 150 || report.part[7] > 250) errors.push(`Part 7 count out of target: ${report.part[7]}.`);
  return { errors, report };
}

export function formatReadingDistribution(report) {
  const lines = [
    `Total Reading Questions: ${report.total}`,
    `Part 5: ${report.part[5] ?? 0}`,
    `Part 6: ${report.part[6] ?? 0}`,
    `Part 7: ${report.part[7] ?? 0}`,
    "", "Skills:",
  ];
  for (const part of [5, 6, 7]) {
    lines.push(`  Part ${part}: ${Object.entries(report.skillByPart[part]).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
  lines.push("", `Difficulty: ${Object.entries(report.difficulty).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  lines.push(`Passage Sets: ${Object.entries(report.passageSets).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  return lines.join("\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = validateReadingSeed();
  if (result.errors.length) {
    console.error(["Reading seed validation failed:", ...result.errors.map((e) => `- ${e}`)].join("\n"));
    process.exitCode = 1;
  } else console.log(`Reading seed validation passed.\n\n${formatReadingDistribution(result.report)}`);
}
