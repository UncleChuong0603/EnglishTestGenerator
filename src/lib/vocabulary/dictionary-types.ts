export type DictionaryCard = {
  term: string;
  phonetic: string;
  audioUrl: string | null;
  partOfSpeech: string;
  meaningEn: string;
  meaningVi: string;
  contextVi?: string;
  example: string;
  source?: "free_dictionary" | "datamuse" | "toeic_gym";
  meaningViSource?: "mymemory" | "toeic_gym";
  contextViSource?: "mymemory";
  sourceUrl?: string;
  license?: { name: string; url: string };
};
