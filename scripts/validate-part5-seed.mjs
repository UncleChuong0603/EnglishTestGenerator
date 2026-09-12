import { fileURLToPath } from "node:url";

import { part5Questions } from "./part5-seed-data.mjs";

export const PART5_SKILLS = ["grammar", "vocabulary"];
export const PART5_SUBSKILLS = [
  "verb_tense",
  "word_form",
  "prepositions",
  "conjunctions_connectors",
  "relative_clauses",
  "pronouns_determiners",
  "gerunds_infinitives",
  "contextual_vocabulary",
  "business_vocabulary",
];

const DIFFICULTIES = ["easy", "medium", "hard"];
const STATUSES = ["draft", "published", "archived"];
const OPTION_KEYS = ["A", "B", "C", "D"];

const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");

function increment(counts, value) {
  counts[value] = (counts[value] ?? 0) + 1;
}

export function validatePart5Questions(questions = part5Questions) {
  const errors = [];
  const seenKeys = new Set();
  const seenQuestionText = new Set();
  const report = { total: questions.length, skill: {}, subSkill: {}, difficulty: {} };

  if (!Array.isArray(questions)) {
    return { errors: ["Seed payload must be an array."], report };
  }

  questions.forEach((question, index) => {
    const label = question?.key || `record ${index + 1}`;
    if (!question || typeof question !== "object" || Array.isArray(question)) {
      errors.push(`Record ${index + 1}: malformed seed record.`);
      return;
    }

    if (typeof question.key !== "string" || !question.key.trim()) {
      errors.push(`${label}: missing deterministic key.`);
    } else if (seenKeys.has(question.key)) {
      errors.push(`${label}: duplicate deterministic key.`);
    } else {
      seenKeys.add(question.key);
    }

    if (question.toeicPart !== 5) errors.push(`${label}: invalid TOEIC part.`);
    if (question.questionType !== "incomplete_sentence") {
      errors.push(`${label}: invalid Part 5 question type.`);
    }
    if (!PART5_SKILLS.includes(question.skill)) errors.push(`${label}: missing or invalid skill.`);
    if (!PART5_SUBSKILLS.includes(question.subSkill)) {
      errors.push(`${label}: missing or invalid subskill.`);
    }
    if (!DIFFICULTIES.includes(question.difficulty)) {
      errors.push(`${label}: missing or invalid difficulty.`);
    }
    if (!STATUSES.includes(question.status)) errors.push(`${label}: invalid status.`);

    if (typeof question.text !== "string" || !question.text.trim()) {
      errors.push(`${label}: missing question text.`);
    } else {
      const normalizedText = normalize(question.text);
      if (seenQuestionText.has(normalizedText)) errors.push(`${label}: duplicate question text.`);
      seenQuestionText.add(normalizedText);
    }

    if (!Array.isArray(question.options) || question.options.length !== 4) {
      errors.push(`${label}: Part 5 questions must have exactly four options.`);
    } else {
      const optionKeys = question.options.map((option) => option?.key);
      const optionTexts = question.options.map((option) =>
        typeof option?.text === "string" ? normalize(option.text) : "",
      );
      if (optionKeys.some((key) => !OPTION_KEYS.includes(key))) {
        errors.push(`${label}: option labels must be A, B, C, and D.`);
      }
      if (new Set(optionKeys).size !== optionKeys.length) {
        errors.push(`${label}: duplicate option label.`);
      }
      if (optionTexts.some((text) => !text)) errors.push(`${label}: missing option text.`);
      if (new Set(optionTexts).size !== optionTexts.length) {
        errors.push(`${label}: duplicate option text.`);
      }
    }

    if (typeof question.answer !== "string" || !question.answer.trim()) {
      errors.push(`${label}: missing correct answer.`);
    } else if (!question.options?.some((option) => option.key === question.answer)) {
      errors.push(`${label}: correct answer does not match a valid option.`);
    }
    if (typeof question.explanationEn !== "string" || !question.explanationEn.trim()) {
      errors.push(`${label}: missing English explanation.`);
    }
    if (typeof question.explanationVi !== "string" || !question.explanationVi.trim()) {
      errors.push(`${label}: missing Vietnamese explanation.`);
    }

    if (PART5_SKILLS.includes(question.skill)) increment(report.skill, question.skill);
    if (PART5_SUBSKILLS.includes(question.subSkill)) increment(report.subSkill, question.subSkill);
    if (DIFFICULTIES.includes(question.difficulty)) increment(report.difficulty, question.difficulty);
  });

  if (questions.length < 60 || questions.length > 100) {
    errors.push(`Question count must be between 60 and 100; received ${questions.length}.`);
  }

  return { errors, report };
}

export function formatDistribution(report) {
  const formatGroup = (title, counts) =>
    [title, ...Object.entries(counts).map(([label, count]) => `  ${label}: ${count}`)].join("\n");
  return [
    `Total: ${report.total}`,
    formatGroup("Skill:", report.skill),
    formatGroup("Subskills:", report.subSkill),
    formatGroup("Difficulty:", report.difficulty),
  ].join("\n\n");
}

function run() {
  const result = validatePart5Questions();
  if (result.errors.length > 0) {
    console.error(["Part 5 seed validation failed:", ...result.errors.map((error) => `- ${error}`)].join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Part 5 seed validation passed.\n\n${formatDistribution(result.report)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) run();

