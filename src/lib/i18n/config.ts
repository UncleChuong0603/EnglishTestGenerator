export const interfaceLanguages = ["en", "vi"] as const;
export const explanationLanguages = ["en", "vi", "both"] as const;

export type InterfaceLanguage = (typeof interfaceLanguages)[number];
export type ExplanationLanguage = (typeof explanationLanguages)[number];

export const DEFAULT_INTERFACE_LANGUAGE: InterfaceLanguage = "vi";
export const DEFAULT_EXPLANATION_LANGUAGE: ExplanationLanguage = "both";
export const LANGUAGE_COOKIE = "toeic_interface_language";

export function isInterfaceLanguage(value: unknown): value is InterfaceLanguage {
  return typeof value === "string" && interfaceLanguages.includes(value as InterfaceLanguage);
}

export function isExplanationLanguage(value: unknown): value is ExplanationLanguage {
  return typeof value === "string" && explanationLanguages.includes(value as ExplanationLanguage);
}
