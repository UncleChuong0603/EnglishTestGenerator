import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { practiceListeningExpansion } from "../content/listening/practice-bank-expansion.mjs";
import { productionListening } from "./content-manifest.mjs";
import { practiceReading } from "./practice-reading-data.mjs";
import { part5Questions, readingPassageSets } from "./reading-seed-data.mjs";
import { validateReadingSeed } from "./validate-reading-seed.mjs";

const targets = { 1: 100, 2: 900, 3: 900, 4: 600, 5: 1000, 6: 400, 7: 1100 };
const normalize = value => value.toLowerCase().replace(/\s+/g, " ").trim();
const errors = [];
const counts = Object.fromEntries(Object.keys(targets).map(part => [part, 0]));
const ids = new Set(productionListening.map(item => item.externalId));
const practiceIds = new Set();
const listeningTranscripts = new Set(productionListening.map(item => normalize(item.transcript)));
let mediaFiles = 0;
let mediaBytes = 0;
const requireMedia = process.argv.includes("--require-media");

for (const item of practiceListeningExpansion) {
  const label = item.externalId;
  const questions = item.questions ?? [item.question];
  if (ids.has(label) || practiceIds.has(label)) errors.push(`${label}: duplicate or colliding external ID`);
  practiceIds.add(label);
  counts[item.part] += questions.length;
  const transcript = normalize(item.transcript);
  if (listeningTranscripts.has(transcript)) errors.push(`${label}: duplicate transcript across banks`);
  listeningTranscripts.add(transcript);
  if (item.part === 1 && item.media.filter(asset => asset.role === "IMAGE").length !== 1) errors.push(`${label}: expected one image`);
  if (item.media.filter(asset => asset.role === "AUDIO").length !== 1) errors.push(`${label}: expected one audio file`);
  if (item.part >= 3 && questions.length !== 3) errors.push(`${label}: expected three questions`);
  if (item.part <= 2 && questions.length !== 1) errors.push(`${label}: expected one question`);
  if (/\b(?:project|report|interview|workshop|supplier|offer|tour) \d+\b/i.test(item.transcript)) errors.push(`${label}: artificial number in transcript`);
  for (const q of questions) {
    const expected = item.part === 2 ? 3 : 4;
    if (q.options.length !== expected) errors.push(`${label}: expected ${expected} options`);
    if (new Set(q.options.map(option => normalize(option.text))).size !== expected) errors.push(`${label}: duplicate options`);
    if (q.options.filter(option => option.key === q.correctKey).length !== 1) errors.push(`${label}: invalid answer key`);
    if (!q.explanationEn?.trim() || !q.explanationVi?.trim()) errors.push(`${label}: missing explanation`);
    if (item.part <= 2 && q.options.some(option => !item.transcript.includes(option.text))) errors.push(`${label}: an audio choice differs from the answer text`);
  }
  for (const asset of item.media) {
    const ext = asset.role === "AUDIO" ? "mp3" : "png";
    const file = resolve(asset.role === "IMAGE" ? asset.assetRef : `.content-generated/${label}.${ext}`);
    if (!existsSync(file)) {
      if (requireMedia) errors.push(`${label}: missing ${asset.role.toLowerCase()} file`);
      continue;
    }
    const size = statSync(file).size;
    if (size < (asset.role === "IMAGE" ? 50_000 : 8_000)) errors.push(`${label}: ${asset.role.toLowerCase()} file appears incomplete (${size} bytes)`);
    mediaFiles += 1;
    mediaBytes += size;
  }
}

const readingResult = validateReadingSeed(practiceReading);
errors.push(...readingResult.errors);
for (const [part, count] of Object.entries(readingResult.report.part)) counts[part] += count;
const oldPart5 = new Set(part5Questions.map(q => normalize(q.text)));
const oldPassages = new Set(readingPassageSets.flatMap(set => set.passages.map(p => normalize(p.content))));
for (const q of practiceReading.part5) if (oldPart5.has(normalize(q.text))) errors.push(`${q.key}: exact Part 5 stem reused from mock`);
for (const set of practiceReading.sets) for (const passage of set.passages) if (oldPassages.has(normalize(passage.content))) errors.push(`${set.key}: exact passage reused from mock`);
for (const [part, target] of Object.entries(targets)) if (counts[part] !== target) errors.push(`Part ${part}: ${counts[part]} / ${target}`);

const report = { counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0), listeningGroups: practiceListeningExpansion.length,
  readingSets: practiceReading.sets.length, mediaFiles, mediaMiB: Math.round(mediaBytes / 1048576), requireMedia, errorCount: errors.length, errors: errors.slice(0, 100) };
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
