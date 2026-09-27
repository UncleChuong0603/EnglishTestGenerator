import { practicePart1Scenes } from "./practice-part1-scenes.mjs";
import { part1Distractor } from "./part1-distractors.mjs";

const keys = ["A", "B", "C", "D"];

export const practicePart1Content = practicePart1Scenes.flatMap((sheet, sheetIndex) => sheet.map(([imagePrompt, correct], sceneIndex) => {
  const number = sheetIndex * 4 + sceneIndex + 1;
  const externalId = `L-P1-PRACTICE-${String(number).padStart(3, "0")}`;
  const options = [0, 1, 2].map(offset => part1Distractor(450 + (number - 1) * 3 + offset));
  // Keep the original correct option key so existing attempts retain their answer.
  options.splice(sceneIndex, 0, correct);
  const rotation = number % 4;
  const choices = options.map((_, position) => options[(position + rotation) % 4]);
  const answerIndex = choices.indexOf(correct);
  if (answerIndex < 0 || choices.filter(value => value === correct).length !== 1) throw new Error(`Ambiguous Part 1 choices: ${externalId}`);
  return {
    externalId, version: 1, part: 1, type: "photograph", status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: "easy",
    transcript: choices.map((text, position) => `${keys[position]}. ${text}`).join("\n"),
    script: [{ speaker: "NARRATOR", text: choices.map((text, position) => `${keys[position]}. ${text}`).join(" ") }],
    media: [
      { role: "IMAGE", assetRef: `content/listening/source/practice-part1/${externalId}.png`, altText: correct },
      { role: "AUDIO", assetRef: `content/listening/audio/${externalId}.mp3` },
    ],
    imagePrompt,
    question: { order: 1, text: "[Spoken choices only]", skill: "photographs", subSkill: "visual_detail", difficulty: "easy",
      options: choices.map((text, position) => ({ key: keys[position], text })), correctKey: keys[answerIndex],
      explanationEn: `The photograph shows this scene: ${correct}`, explanationVi: `Bức ảnh thể hiện cảnh: ${correct}` },
  };
}));
