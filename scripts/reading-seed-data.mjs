import { part5Questions as originalPart5Questions } from "./part5-seed-data.mjs";
import { part5ExpansionQuestions } from "./part5-expansion-data.mjs";
import { part5BlueprintExpansion } from "./part5-blueprint-expansion-data.mjs";
import { part5TwentyFiveFormExpansion } from "./part5-25-form-expansion-data.mjs";
import { part6Sets } from "./part6-seed-data.mjs";
import { part7Sets } from "./part7-seed-data.mjs";
import { part6BlueprintExpansion, part7BlueprintExpansion } from "./reading-blueprint-expansion-data.mjs";
import { part6TwentyFiveFormExpansion, part7TwentyFiveFormExpansion } from "./reading-25-form-expansion-data.mjs";
import { contextualizePart5, contextualizeReadingSet } from "./unique-question-bank-options.mjs";

export const part5Questions = [...originalPart5Questions, ...part5ExpansionQuestions, ...part5BlueprintExpansion, ...part5TwentyFiveFormExpansion].map(contextualizePart5);
export const readingPassageSets = [
  ...part6Sets,
  ...part6BlueprintExpansion,
  ...part6TwentyFiveFormExpansion,
  ...part7Sets,
  ...part7BlueprintExpansion,
  ...part7TwentyFiveFormExpansion,
].map(contextualizeReadingSet);
