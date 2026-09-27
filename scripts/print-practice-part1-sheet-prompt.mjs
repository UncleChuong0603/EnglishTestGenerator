import { practicePart1Scenes } from "../content/listening/practice-part1-scenes.mjs";

const sheetNumber = Number(process.argv[2]);
if (!Number.isInteger(sheetNumber) || sheetNumber < 1 || sheetNumber > practicePart1Scenes.length) {
  throw new Error("Usage: node scripts/print-practice-part1-sheet-prompt.mjs <1..25>");
}
const positions = ["top-left", "top-right", "bottom-left", "bottom-right"];
const scenes = practicePart1Scenes[sheetNumber - 1];
console.log(`Create one photorealistic 2×2 contact sheet for TOEIC listening Part 1, sheet ${sheetNumber} of 25. Output a square 1254×1254 PNG. Use four separate 620×620 photographs, with a 14-pixel pure-white vertical gutter and a 14-pixel pure-white horizontal gutter. Keep every scene fully inside its panel. No captions, letters, labels, logos, watermarks, borders, or text. Realistic people, hands, objects, lighting, and workplace details. Each panel must visibly show the action described. Do not mix the four scenes.\n`);
for (const [index, [scene]] of scenes.entries()) console.log(`${positions[index]} panel: ${scene}.`);
