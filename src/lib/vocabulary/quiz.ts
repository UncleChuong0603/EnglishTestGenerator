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

/**
 * Builds one meaning question from the vocabulary pool.
 * Distractors are sampled with replacement so repeated wrong meanings are valid.
 */
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
  const distractors = usable.filter((item) => item.key !== entry.key && normalizedMeaning(locale === "vi" ? item.meaningVi : item.meaningEn) !== normalizedMeaning(correctMeaning));
  if (!distractors.length) return null;

  const options = shuffle([
    { id: "correct", text: correctMeaning },
    ...Array.from({ length: 3 }, (_, index) => {
      const distractor = distractors[randomIndex(distractors.length, random)];
      return { id: `wrong-${index}`, text: (locale === "vi" ? distractor.meaningVi : distractor.meaningEn).trim() };
    }),
  ], random);

  return { entryKey: entry.key, term: entry.term, correctOptionId: "correct", options };
}
