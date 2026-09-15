import { listeningFixtures } from "./listening-fixture-data.mjs";

const ids = new Set();
for (const item of listeningFixtures) {
  if (ids.has(item.externalId)) throw new Error(`Duplicate fixture: ${item.externalId}`); ids.add(item.externalId);
  if (item.skillArea !== "LISTENING" || ![1, 2].includes(item.part) || item.responseType !== "MULTIPLE_CHOICE") throw new Error(`Invalid taxonomy: ${item.externalId}`);
  const roles = item.media.map((media) => media.role); if (!roles.includes("AUDIO") || (item.part === 1 && !roles.includes("IMAGE")) || (item.part === 2 && roles.includes("IMAGE"))) throw new Error(`Invalid media: ${item.externalId}`);
  if (item.question.options.length !== (item.part === 1 ? 4 : 3) || !item.question.options.some((option) => option.key === item.question.correctKey)) throw new Error(`Invalid options: ${item.externalId}`);
  if (!item.transcript.trim() || !item.question.explanationEn.trim() || !item.question.explanationVi.trim()) throw new Error(`Missing review content: ${item.externalId}`);
  if (item.media.some((media) => /https?:\/\//.test(media.assetRef))) throw new Error(`Signed URL not allowed: ${item.externalId}`);
}
const p1 = listeningFixtures.filter((item) => item.part === 1).length; const p2 = listeningFixtures.filter((item) => item.part === 2).length;
if (p1 !== 5 || p2 !== 10) throw new Error(`Unexpected counts: Part 1=${p1}, Part 2=${p2}`);
console.log(`Listening fixtures valid: Part 1=${p1}, Part 2=${p2}, total=${listeningFixtures.length}`);

