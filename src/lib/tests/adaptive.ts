import { skills, type QuestionCandidate, type Skill } from "./types";

export type HistoricalSkill = { skill: Skill; correct: number; total: number };

function stableFraction(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

/**
 * Selects a balanced set while giving lower-accuracy and less-seen skills more weight.
 * The seed changes between attempts but makes a given selection reproducible in tests.
 */
export function selectAdaptiveQuestions(
  candidates: QuestionCandidate[],
  history: HistoricalSkill[],
  count: number,
  seed: string,
) {
  const historyMap = new Map(history.map((item) => [item.skill, item]));
  const maximumPerSkill = Math.ceil(count * 0.4);
  const selected: QuestionCandidate[] = [];
  const selectedIds = new Set<string>();
  const skillCounts = new Map<Skill, number>();

  const ranked = candidates
    .map((candidate) => {
      const record = historyMap.get(candidate.skill);
      const accuracy = record?.total ? record.correct / record.total : 0.5;
      const needWeight = 1 + (1 - accuracy) * 2;
      const noveltyWeight = 1 / (1 + candidate.previousUses * 0.35);
      const variety = 0.85 + stableFraction(`${seed}:${candidate.id}`) * 0.3;
      return { candidate, score: needWeight * noveltyWeight * variety };
    })
    .sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id));

  // Preserve breadth: take one question from every available core skill first.
  for (const skill of skills) {
    const match = ranked.find((item) => item.candidate.skill === skill && !selectedIds.has(item.candidate.id));
    if (match && selected.length < count) {
      selected.push(match.candidate);
      selectedIds.add(match.candidate.id);
      skillCounts.set(skill, 1);
    }
  }

  for (const item of ranked) {
    if (selected.length >= count) break;
    const candidate = item.candidate;
    if (selectedIds.has(candidate.id)) continue;
    if ((skillCounts.get(candidate.skill) ?? 0) >= maximumPerSkill) continue;
    selected.push(candidate);
    selectedIds.add(candidate.id);
    skillCounts.set(candidate.skill, (skillCounts.get(candidate.skill) ?? 0) + 1);
  }

  return selected;
}
