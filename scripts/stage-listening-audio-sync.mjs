import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { productionListening } from "./content-manifest.mjs";
import { planListeningAudio } from "../src/lib/content/audio-segments.ts";
import { selectContentVoice } from "../src/lib/content/tts.ts";

const planPath = process.argv[2];
const outputDir = process.argv[3];
if (!planPath || !outputDir) throw new Error("Plan JSON and output directory are required");
const plan = JSON.parse(await readFile(planPath, "utf8"));
const byId = new Map(productionListening.map((item) => [item.externalId, item]));
const providerName = (process.env.CONTENT_TTS_PROVIDER || "edge").toLowerCase();
await mkdir(outputDir, { recursive: true });
let bytes = 0;
for (const group of plan.audioGroups) {
  const item = byId.get(group.externalId);
  if (!item) throw new Error(`Unknown Listening group ${group.externalId}`);
  const source = path.resolve(".content-generated", `${item.externalId}.mp3`);
  const body = await readFile(source);
  const metadata = JSON.parse(await readFile(`${source}.json`, "utf8"));
  const fingerprint = createHash("sha256").update(JSON.stringify({
    segments: planListeningAudio(item), voice: selectContentVoice(providerName, item.externalId),
    providerName, model: process.env.CONTENT_TTS_MODEL, audioTimingVersion: 2,
  })).digest("hex");
  if (metadata.fingerprint !== fingerprint) throw new Error(`Stale audio for ${item.externalId}`);
  if (!((body[0] === 0x49 && body[1] === 0x44 && body[2] === 0x33) || (body[0] === 0xff && (body[1] & 0xe0) === 0xe0))) throw new Error(`Invalid MP3 header for ${item.externalId}`);
  bytes += body.length;
  await copyFile(source, path.resolve(outputDir, `${item.externalId}.mp3`));
}
console.log(`Staged ${plan.audioGroups.length} matching audio files (${bytes} bytes).`);
