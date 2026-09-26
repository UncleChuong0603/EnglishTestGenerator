import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const [source, sheetNumberRaw] = process.argv.slice(2);
const sheetNumber = Number(sheetNumberRaw);
if (!source || !Number.isInteger(sheetNumber) || sheetNumber < 1 || sheetNumber > 25) {
  throw new Error("Usage: node scripts/extract-practice-part1-sheet.mjs <contact-sheet.png> <1..25>");
}
const metadata = await sharp(source).metadata();
if (metadata.width !== 1254 || metadata.height !== 1254) throw new Error(`Expected a 1254×1254 contact sheet, got ${metadata.width}×${metadata.height}`);
const outputDir = resolve("content/listening/source/practice-part1");
await mkdir(outputDir, { recursive: true });
const boxes = [
  { left: 0, top: 0, width: 620, height: 620 },
  { left: 634, top: 0, width: 620, height: 620 },
  { left: 0, top: 634, width: 620, height: 620 },
  { left: 634, top: 634, width: 620, height: 620 },
];
for (const [index, box] of boxes.entries()) {
  const n = (sheetNumber - 1) * 4 + index + 1;
  const output = resolve(outputDir, `L-P1-PRACTICE-${String(n).padStart(3, "0")}.png`);
  await sharp(source).extract(box).png({ compressionLevel: 9 }).toFile(output);
  console.log(output);
}
