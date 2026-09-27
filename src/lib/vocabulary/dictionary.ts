import "server-only";
import type { DictionaryCard } from "./dictionary-types";
import { vocabularyByKey } from "./catalog";

const validWord = /^[a-z]+(?:['-][a-z]+)*$/;

export function normalizeDictionaryWord(value: string) {
  const word = value.trim().toLowerCase().replace(/[’]/g, "'");
  return word.length <= 48 && validWord.test(word) ? word : null;
}

function candidates(word: string) {
  const words = [word];
  if (word.endsWith("ies")) words.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("ing")) words.push(word.slice(0, -3), `${word.slice(0, -3)}e`);
  if (word.endsWith("ed")) words.push(word.slice(0, -2), word.slice(0, -1));
  if (word.endsWith("s")) words.push(word.slice(0, -1));
  if (word.endsWith("es")) words.push(word.slice(0, -2));
  return [...new Set(words.filter((item) => item.length >= 1))].slice(0, 5);
}

type ApiEntry = { word?: string; phonetic?: string; license?: { name: string; url: string }; sourceUrls?: string[]; phonetics?: { text?: string; audio?: string }[]; meanings?: { partOfSpeech?: string; definitions?: { definition?: string; example?: string }[] }[] };

async function translateMeaning(definition: string) {
  try {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", definition.slice(0, 450));
    url.searchParams.set("langpair", "en|vi");
    const response = await fetch(url, { signal: AbortSignal.timeout(4500), next: { revalidate: 60 * 60 * 24 * 30 } });
    if (!response.ok) return "";
    const data = await response.json() as { responseStatus?: number; responseData?: { translatedText?: string } };
    return data.responseStatus === 200 ? (data.responseData?.translatedText ?? "").slice(0, 500) : "";
  } catch { return ""; }
}

export async function lookupDictionaryWord(input: string): Promise<DictionaryCard | null> {
  const word = normalizeDictionaryWord(input);
  if (!word) return null;
  for (const candidate of candidates(word)) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(candidate)}`, { signal: AbortSignal.timeout(4500), next: { revalidate: 60 * 60 * 24 * 14 } });
      if (response.status === 404) continue;
      if (!response.ok) return null;
      const entries = await response.json() as ApiEntry[];
      const entry = entries[0];
      const sense = entry?.meanings?.flatMap((meaning) => (meaning.definitions ?? []).map((definition) => ({ ...definition, partOfSpeech: meaning.partOfSpeech }))).find((item) => item.definition);
      if (!sense?.definition) continue;
      const audio = entry.phonetics?.find((item) => item.audio)?.audio;
      // Same-origin audio proxy respects the application's media CSP.
      const audioUrl = audio ? `/api/vocabulary/audio/${encodeURIComponent(candidate)}` : null;
      const meaningEn = sense.definition.slice(0, 500);
      const curated = vocabularyByKey(candidate);
      return {
        term: candidate, phonetic: (entry.phonetic || entry.phonetics?.find((item) => item.text)?.text || "").slice(0, 80),
        audioUrl, partOfSpeech: (sense.partOfSpeech ?? "").slice(0, 40), meaningEn,
        meaningVi: curated?.meaningVi ?? await translateMeaning(meaningEn), example: (sense.example ?? "").slice(0, 500),
        sourceUrl: entry.sourceUrls?.find((url) => url.startsWith("https://en.wiktionary.org/")),
        license: entry.license?.url?.startsWith("https://creativecommons.org/") ? entry.license : undefined,
      };
    } catch { return null; }
  }
  return null;
}
