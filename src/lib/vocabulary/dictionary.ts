import "server-only";
import type { DictionaryCard } from "./dictionary-types";
import { foundationalVocabularyByKey, vocabularyByKey } from "./catalog";
import { normalizePartOfSpeech } from "./part-of-speech";

const validWord = /^[a-z]+(?:['-][a-z]+)*$/;

export function normalizeDictionaryWord(value: string) {
  const word = value.trim().toLowerCase().replace(/[’]/g, "'");
  return word.length <= 48 && validWord.test(word) ? word : null;
}

const irregularBases: Record<string, string> = {
  began: "begin", begun: "begin", bought: "buy", brought: "bring", built: "build", came: "come", chose: "choose", chosen: "choose",
  did: "do", done: "do", drew: "draw", drawn: "draw", drove: "drive", driven: "drive", ate: "eat", eaten: "eat", fell: "fall",
  fallen: "fall", felt: "feel", found: "find", gave: "give", given: "give", gone: "go", grew: "grow", grown: "grow", had: "have",
  heard: "hear", held: "hold", kept: "keep", knew: "know", known: "know", led: "lead", left: "leave", lost: "lose", made: "make",
  meant: "mean", met: "meet", paid: "pay", ran: "run", read: "read", rose: "rise", risen: "rise", said: "say", saw: "see",
  seen: "see", sent: "send", sat: "sit", spoke: "speak", spoken: "speak", spent: "spend", stood: "stand", took: "take",
  taken: "take", thought: "think", told: "tell", understood: "understand", went: "go", wore: "wear", worn: "wear", wrote: "write", written: "write",
};

export function dictionaryCandidates(word: string) {
  const words: string[] = [];
  const irregular = irregularBases[word];
  if (irregular) words.push(irregular);
  if (!irregular && word.endsWith("ed") && word.length > 3) {
    const stem = word.slice(0, -2);
    if (stem.at(-1) === stem.at(-2)) words.push(stem.slice(0, -1));
    words.push(stem, `${stem}e`);
  }
  words.push(word);
  if (word.endsWith("ies") && word.length > 3) words.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("ing") && word.length > 4) {
    const stem = word.slice(0, -3);
    if (stem.at(-1) === stem.at(-2)) words.push(stem.slice(0, -1));
    words.push(stem, `${stem}e`);
  }
  if (word.endsWith("es") && word.length > 3) words.push(word.slice(0, -2));
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 2) words.push(word.slice(0, -1));
  return [...new Set(words.filter((item) => item.length >= 1 && validWord.test(item)))].slice(0, 6);
}

type ApiEntry = { word?: string; phonetic?: string; license?: { name: string; url: string }; sourceUrls?: string[]; phonetics?: { text?: string; audio?: string }[]; meanings?: { partOfSpeech?: string; definitions?: { definition?: string; example?: string }[] }[] };
type DatamuseEntry = { word?: string; defs?: string[]; tags?: string[] };

type TranslationMatch = { translation?: string; quality?: string | number; match?: number };

function translationTokens(value: string) {
  return new Set(value.toLocaleLowerCase("vi-VN").match(/[\p{L}\p{N}]+/gu) ?? []);
}

function chooseTranslation(term: string, translatedText: string, matches: TranslationMatch[], knownMeaningVi = "") {
  const known = translationTokens(knownMeaningVi);
  const options = [translatedText, ...matches.map((match) => match.translation ?? "")]
    .map((translation) => translation.trim().replace(/[.]+$/, ""))
    .filter((translation, index, all) => translation && translation.toLowerCase() !== term && all.indexOf(translation) === index);
  if (!options.length) return "";
  return options.map((translation) => {
    const overlap = [...translationTokens(translation)].filter((token) => known.has(token)).length;
    const source = matches.find((match) => match.translation?.trim().replace(/[.]+$/, "") === translation);
    const quality = Number(source?.quality ?? 0) / 100;
    const match = Number(source?.match ?? (translation === translatedText.trim().replace(/[.]+$/, "") ? 1 : 0));
    return { translation, score: overlap * 10 + quality + match - translation.length / 1000 };
  }).sort((a, b) => b.score - a.score)[0].translation.slice(0, 160);
}

async function translateText(text: string, knownMeaningVi = "") {
  try {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", text.slice(0, 450));
    url.searchParams.set("langpair", "en|vi");
    const response = await fetch(url, { signal: AbortSignal.timeout(2200), next: { revalidate: 60 * 60 * 24 * 30 } });
    if (!response.ok) return "";
    const data = await response.json() as { responseStatus?: number; responseData?: { translatedText?: string }; matches?: TranslationMatch[] };
    const translated = data.responseStatus === 200 ? (data.responseData?.translatedText ?? "").trim() : "";
    return chooseTranslation(text, translated, data.matches ?? [], knownMeaningVi);
  } catch { return ""; }
}

// A short headword translation is intentionally separate from the English
// definition. It reads like a vocabulary gloss instead of formal prose.
function translateGloss(term: string, knownMeaningVi = "") { return translateText(term, knownMeaningVi); }

function translateContext(context: string) {
  const sentence = context.replace(/\s+/g, " ").trim().slice(0, 450);
  return sentence ? translateText(sentence) : Promise.resolve("");
}

function timeoutSignal(ms: number, parent?: AbortSignal) {
  return parent ? AbortSignal.any([parent, AbortSignal.timeout(ms)]) : AbortSignal.timeout(ms);
}

async function freeDictionaryCard(candidate: string, signal?: AbortSignal): Promise<DictionaryCard | null> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(candidate)}`, { signal: timeoutSignal(2200, signal), next: { revalidate: 60 * 60 * 24 * 14 } });
    if (!response.ok) return null;
    const entries = await response.json() as ApiEntry[];
    if (!Array.isArray(entries)) return null;
    const entry = entries[0];
    const sense = entry?.meanings?.flatMap((meaning) => (meaning.definitions ?? []).map((definition) => ({ ...definition, partOfSpeech: meaning.partOfSpeech }))).find((item) => item.definition);
    if (!sense?.definition) return null;
    const audio = entry.phonetics?.find((item) => item.audio)?.audio;
    return {
      term: candidate,
      phonetic: (entry.phonetic || entry.phonetics?.find((item) => item.text)?.text || "").slice(0, 80),
      audioUrl: audio ? `/api/vocabulary/audio/${encodeURIComponent(candidate)}` : null,
      partOfSpeech: normalizePartOfSpeech(sense.partOfSpeech),
      meaningEn: sense.definition.slice(0, 500),
      meaningVi: "",
      example: (sense.example ?? "").slice(0, 500),
      source: "free_dictionary",
      sourceUrl: entry.sourceUrls?.find((url) => url.startsWith("https://en.wiktionary.org/")),
      license: entry.license?.url?.startsWith("https://creativecommons.org/") ? entry.license : undefined,
    };
  } catch { return null; }
}

async function datamuseCard(candidate: string, signal?: AbortSignal): Promise<DictionaryCard | null> {
  try {
    const url = new URL("https://api.datamuse.com/words");
    url.searchParams.set("sp", candidate);
    url.searchParams.set("qe", "sp");
    url.searchParams.set("md", "dpr");
    url.searchParams.set("max", "1");
    const response = await fetch(url, { signal: timeoutSignal(2200, signal), next: { revalidate: 60 * 60 * 24 * 14 } });
    if (!response.ok) return null;
    const data = await response.json() as DatamuseEntry[];
    const entry = Array.isArray(data) ? data[0] : undefined;
    if (entry?.word?.toLowerCase() !== candidate) return null;
    const rawDefinition = entry.defs?.find((definition) => definition.includes("\t") && !/\b(obsolete|archaic|rare)\b/i.test(definition));
    if (!rawDefinition) return null;
    const [partOfSpeech, ...definitionParts] = rawDefinition.split("\t");
    const pronunciation = entry.tags?.find((tag) => tag.startsWith("pron:"))?.slice(5) ?? "";
    return {
      term: candidate,
      phonetic: pronunciation ? `/${pronunciation}/` : "",
      audioUrl: null,
      partOfSpeech: normalizePartOfSpeech(partOfSpeech),
      meaningEn: definitionParts.join(" ").trim().slice(0, 500),
      meaningVi: "",
      example: "",
      source: "datamuse",
    };
  } catch { return null; }
}

async function externalCard(candidate: string, signal?: AbortSignal) {
  const [freeDictionary, datamuse] = await Promise.all([
    freeDictionaryCard(candidate, signal),
    datamuseCard(candidate, signal),
  ]);
  if (!freeDictionary) return datamuse;
  return {
    ...freeDictionary,
    partOfSpeech: freeDictionary.partOfSpeech || datamuse?.partOfSpeech || "",
  };
}

export async function lookupDictionaryWord(input: string, context = ""): Promise<DictionaryCard | null> {
  const word = normalizeDictionaryWord(input);
  if (!word) return null;
  const words = dictionaryCandidates(word);
  const localCandidate = words.find((candidate) => vocabularyByKey(candidate));
  if (localCandidate) {
    const local = vocabularyByKey(localCandidate)!;
    const foundational = foundationalVocabularyByKey(localCandidate);
    // Give the richer source a short chance to add IPA/audio, but never let an
    // unreliable upstream hide a word already available in our local catalog.
    const [external, translated, contextVi] = await Promise.all([
      externalCard(localCandidate, AbortSignal.timeout(1500)),
      foundational ? Promise.resolve("") : translateGloss(localCandidate, local.meaningVi),
      translateContext(context),
    ]);
    return {
      ...(external ?? { term: localCandidate, phonetic: "", audioUrl: null, partOfSpeech: "", meaningEn: local.meaningEn, example: "", source: "toeic_gym" as const }),
      meaningVi: foundational?.meaningVi || translated || local.meaningVi,
      contextVi: contextVi || undefined,
      meaningViSource: foundational || !translated ? "toeic_gym" : "mymemory",
      contextViSource: contextVi ? "mymemory" : undefined,
    };
  }
  for (const candidate of words) {
    const card = await externalCard(candidate);
    if (!card) continue;
    const [translated, contextVi] = await Promise.all([translateGloss(candidate), translateContext(context)]);
    return { ...card, meaningVi: translated, contextVi: contextVi || undefined, meaningViSource: translated ? "mymemory" : undefined, contextViSource: contextVi ? "mymemory" : undefined };
  }
  return null;
}
