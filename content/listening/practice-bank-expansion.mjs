import { practiceResponse } from "./practice-response-original.mjs";
import { practiceConversation, practiceTalk } from "./practice-listening-original.mjs";
import { practicePart1Content } from "./practice-part1-content.mjs";
import { uniquifyPracticeDistractors } from "./practice-unique-distractors.mjs";

const basePracticeListening = [
  ...practicePart1Content,
  ...Array.from({ length: 900 }, (_, index) => practiceResponse(index)),
  ...Array.from({ length: 300 }, (_, index) => practiceConversation(index + 1)),
  ...Array.from({ length: 200 }, (_, index) => practiceTalk(index + 1)),
];

const task60RecoveryListening = [
  ...Array.from({ length: 17 }, (_, index) => practiceResponse(index + 900)),
  ...Array.from({ length: 27 }, (_, index) => practiceConversation(index + 301)),
  ...Array.from({ length: 34 }, (_, index) => practiceTalk(index + 201)),
];

// Apply uniqueness across both corpora so new distractors cannot collide with
// the existing practice bank while retaining the original item order and IDs.
const allPracticeListening = uniquifyPracticeDistractors([
  ...basePracticeListening,
  ...task60RecoveryListening,
]);

export const practiceListeningExpansion = allPracticeListening.slice(0, basePracticeListening.length);
export const task60PracticeListeningRecovery = allPracticeListening.slice(basePracticeListening.length);
