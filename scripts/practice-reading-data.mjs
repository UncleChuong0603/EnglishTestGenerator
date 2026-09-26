import { additionalPart5Patterns } from "./practice-part5-patterns.mjs";
import { practicePart6Set } from "./practice-part6-data.mjs";
import { practiceDoubleSet } from "./practice-part7-double-data.mjs";
import { practiceSingleSet } from "./practice-part7-single-data.mjs";

const keys = ["A", "B", "C", "D"];
const names = ["Aster", "Bayview", "Clearwater", "Dunhill", "Easton", "Foxbridge", "Goldleaf", "Highland", "Ironwood", "Jasper", "Kestrel", "Longview", "Meadowbrook", "Newhaven", "Orchard", "Pinecrest", "Quarry", "Riverton", "Silverlake", "Tamarack", "Uplands", "Valley", "Westhaven", "Yorkfield", "Zenith"];

const part5Patterns = additionalPart5Patterns;
const part5Organizations = names.slice(0, 20);
export const practicePart5 = part5Patterns.flatMap((pattern, patternIndex) => part5Organizations.map((org, orgIndex) => {
  const answerIndex = (patternIndex + orgIndex) % 4;
  const values = [...pattern.wrong];
  values.splice(answerIndex, 0, pattern.correct);
  const question = {
    key: `p5-practice-${String(patternIndex * part5Organizations.length + orgIndex + 1).padStart(4, "0")}`,
    toeicPart: 5, questionType: "incomplete_sentence", skill: pattern.skill, subSkill: pattern.subSkill,
    difficulty: orgIndex % 8 === 0 ? "hard" : orgIndex % 3 === 0 ? "easy" : "medium", status: "published",
    text: pattern.sentence(org), options: values.map((text, position) => ({ key: keys[position], text })),
    answer: keys[answerIndex], explanationEn: pattern.en, explanationVi: pattern.vi,
  };
  return question;
}));

export const practicePart6 = Array.from({ length: 100 }, (_, index) => practicePart6Set(index));

export const practicePart7 = [
  ...Array.from({ length: 200 }, (_, index) => practiceSingleSet(index)),
  ...Array.from({ length: 100 }, (_, index) => practiceDoubleSet(index)),
];

export const practiceReading = { part5: practicePart5, sets: [...practicePart6, ...practicePart7] };
