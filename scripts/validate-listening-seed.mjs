import { productionListening as listeningFixtures } from "./content-manifest.mjs";

const ids = new Set();
const distractorSets = new Map();
const optionTexts = new Map();
const mojibake = /(?:Ã.|Â.|Ä.|Æ.|â€|ï¿½)/;
const taxonomy = {
  1: { photographs: ["visual_detail"] },
  2: { question_response: ["direct_response", "when", "who", "where", "why", "how", "what", "request", "suggestion", "offer", "confirmation", "which", "indirect_response", "frequency"] },
  3: { purpose: ["purpose"], detail: ["location", "explicit_information"], next_action: ["next_action"] },
  4: { purpose: ["purpose"], detail: ["location", "explicit_information"], next_action: ["next_action"], inference: ["implied_information"] },
};
for (const item of listeningFixtures) {
  if (ids.has(item.externalId)) throw new Error(`Duplicate content key: ${item.externalId}`); ids.add(item.externalId);
  if (item.skillArea !== "LISTENING" || ![1, 2, 3, 4].includes(item.part) || item.responseType !== "MULTIPLE_CHOICE") throw new Error(`Invalid taxonomy: ${item.externalId}`);
  const roles = item.media.map((media) => media.role);
  if (roles.filter((role) => role === "AUDIO").length !== 1 || (item.part === 1 && !roles.includes("IMAGE")) || (item.part === 2 && roles.includes("IMAGE"))) throw new Error(`Invalid media: ${item.externalId}`);
  const questions = item.questions ?? [item.question];
  if ((item.part <= 2 && questions.length !== 1) || (item.part >= 3 && questions.length !== 3)) throw new Error(`Invalid group size: ${item.externalId}`);
  if (item.part >= 3 && (item.type !== (item.part === 3 ? "conversation" : "talk") || questions.some((question, index) => question.order !== index + 1))) throw new Error(`Invalid group: ${item.externalId}`);
  for (const question of questions) {
    const expected = item.part === 2 ? 3 : 4;
    if (question.options.length !== expected || new Set(question.options.map((option) => option.text.trim().toLowerCase())).size !== expected || question.options.filter((option) => option.key === question.correctKey).length !== 1) throw new Error(`Invalid options: ${item.externalId}`);
    for (const option of question.options) {
      const normalized = option.text.trim().replace(/\s+/g, " ").toLowerCase();
      const previous = optionTexts.get(normalized);
      if (previous) throw new Error(`Reused Listening choice: ${previous} and ${item.externalId}/Q${question.order}`);
      optionTexts.set(normalized, `${item.externalId}/Q${question.order}`);
    }
    if (!question.explanationEn?.trim() || !question.explanationVi?.trim()) throw new Error(`Missing explanation: ${item.externalId}`);
    if ([item.transcript, question.text, question.explanationEn, question.explanationVi, ...question.options.map((option) => option.text)].some((text) => mojibake.test(text))) throw new Error(`Mojibake detected: ${item.externalId}`);
    if (!taxonomy[item.part]?.[question.skill]?.includes(question.subSkill)) throw new Error(`Unknown taxonomy: ${item.externalId}/${question.skill}/${question.subSkill}`);
    if (item.part >= 3) {
      const distractors = question.options.filter((option) => option.key !== question.correctKey).map((option) => option.text.trim().toLowerCase()).sort().join("|");
      const previous = distractorSets.get(distractors);
      if (previous) throw new Error(`Reused distractor set: ${previous} and ${item.externalId}/Q${question.order}`);
      distractorSets.set(distractors, `${item.externalId}/Q${question.order}`);
    }
  }
  if (!item.transcript.trim()) throw new Error(`Missing transcript: ${item.externalId}`);
  if (item.media.some((media) => /https?:\/\//.test(media.assetRef))) throw new Error(`Signed URL not allowed: ${item.externalId}`);
}
const fixtureCount = (part) => listeningFixtures.filter((item) => item.part === part).length;
const questionCount = (part) => listeningFixtures.filter((item) => item.part === part).reduce((sum, item) => sum + (item.questions?.length ?? 1), 0);
if (fixtureCount(1) < 6 || fixtureCount(2) < 25 || fixtureCount(3) < 13 || fixtureCount(4) < 10) throw new Error("Listening production coverage is below the Full Mock minimum");
console.log(`Listening content valid: Part 1=${questionCount(1)}, Part 2=${questionCount(2)}, Part 3=${fixtureCount(3)} groups/${questionCount(3)} questions, Part 4=${fixtureCount(4)} groups/${questionCount(4)} questions, total=${[1,2,3,4].reduce((sum, part) => sum + questionCount(part), 0)}`);
