import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { VocabularyEntry } from "./catalog";

export type VocabularyQuizOption = { id: string; text: string };

export type VocabularyQuizQuestion = {
  entryKey: string;
  term: string;
  correctOptionId: string;
  options: VocabularyQuizOption[];
};

type RandomSource = () => number;

const normalizedMeaning = (value: string) => value.trim().toLocaleLowerCase();

function randomIndex(length: number, random: RandomSource) {
  if (length <= 1) return 0;
  const sampled = random();
  const value = Number.isFinite(sampled) ? sampled : 0;
  return Math.min(length - 1, Math.max(0, Math.floor(value * length)));
}

function shuffle<T>(items: T[], random: RandomSource) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

/** Builds one question with four distinct meanings from the vocabulary pool. */
export function createVocabularyQuizQuestion(
  entries: readonly VocabularyEntry[],
  locale: InterfaceLanguage,
  random: RandomSource = Math.random,
  excludedKey?: string,
): VocabularyQuizQuestion | null {
  const usable = entries.filter((entry) => Boolean(entry.term.trim() && (locale === "vi" ? entry.meaningVi : entry.meaningEn).trim()));
  if (usable.length < 2) return null;

  const candidates = excludedKey && usable.some((entry) => entry.key !== excludedKey) ? usable.filter((entry) => entry.key !== excludedKey) : usable;
  const entry = candidates[randomIndex(candidates.length, random)];
  const correctMeaning = locale === "vi" ? entry.meaningVi.trim() : entry.meaningEn.trim();
  const uniqueDistractors = new Map<string, string>();
  for (const item of usable) {
    const meaning = (locale === "vi" ? item.meaningVi : item.meaningEn).trim();
    const normalized = normalizedMeaning(meaning);
    if (item.key !== entry.key && normalized !== normalizedMeaning(correctMeaning) && !uniqueDistractors.has(normalized)) uniqueDistractors.set(normalized, meaning);
  }
  if (uniqueDistractors.size < 3) return null;

  const distractors = shuffle([...uniqueDistractors.values()], random).slice(0, 3);

  const options = shuffle([
    { id: "correct", text: correctMeaning },
    ...distractors.map((text, index) => ({ id: `wrong-${index}`, text })),
  ], random);

  return { entryKey: entry.key, term: entry.term, correctOptionId: "correct", options };
}
