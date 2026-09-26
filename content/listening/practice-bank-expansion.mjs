import { practiceResponse } from "./practice-response-original.mjs";
import { practiceConversation, practiceTalk } from "./practice-listening-original.mjs";
import { practicePart1Content } from "./practice-part1-content.mjs";

export const practiceListeningExpansion = [
  ...practicePart1Content,
  ...Array.from({ length: 900 }, (_, index) => practiceResponse(index)),
  ...Array.from({ length: 300 }, (_, index) => practiceConversation(index + 1)),
  ...Array.from({ length: 200 }, (_, index) => practiceTalk(index + 1)),
];
