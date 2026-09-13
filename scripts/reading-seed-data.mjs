import { part5Questions as originalPart5Questions } from "./part5-seed-data.mjs";
import { part5ExpansionQuestions } from "./part5-expansion-data.mjs";
import { part6Sets } from "./part6-seed-data.mjs";
import { part7Sets } from "./part7-seed-data.mjs";

export const part5Questions = [...originalPart5Questions, ...part5ExpansionQuestions];
export const readingPassageSets = [...part6Sets, ...part7Sets];

