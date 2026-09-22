import { part5Questions as originalPart5Questions } from "./part5-seed-data.mjs";
import { part5ExpansionQuestions } from "./part5-expansion-data.mjs";
import { part5BlueprintExpansion } from "./part5-blueprint-expansion-data.mjs";
import { part6Sets } from "./part6-seed-data.mjs";
import { part7Sets } from "./part7-seed-data.mjs";
import { part6BlueprintExpansion, part7BlueprintExpansion } from "./reading-blueprint-expansion-data.mjs";

export const part5Questions = [...originalPart5Questions, ...part5ExpansionQuestions, ...part5BlueprintExpansion];
export const readingPassageSets = [
  ...part6Sets,
  ...part6BlueprintExpansion,
  ...part7Sets,
  ...part7BlueprintExpansion,
];
