export type DictionaryCard = {
  term: string;
  phonetic: string;
  audioUrl: string | null;
  partOfSpeech: string;
  meaningEn: string;
  meaningVi: string;
  example: string;
  sourceUrl?: string;
  license?: { name: string; url: string };
};
