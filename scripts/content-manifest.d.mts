export type ContentOption = { key: string; text: string };
export type ContentQuestion = {
  order: number;
  text: string;
  skill: string;
  subSkill: string;
  difficulty?: string;
  options: ContentOption[];
  correctKey: string;
  explanationEn: string;
  explanationVi: string;
};
type ListeningContentBase = {
  externalId: string;
  version?: number;
  part: number;
  type: string;
  difficulty?: string;
  transcript: string;
  media: Array<{ role: "AUDIO" | "IMAGE"; assetRef: string; altText?: string }>;
};
export type ListeningContentItem = ListeningContentBase & (
  | { question: ContentQuestion; questions?: never }
  | { questions: ContentQuestion[]; question?: never }
);
export const productionListening: ListeningContentItem[];
export const listeningManifest: ListeningContentItem[];
