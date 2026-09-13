import type { InterfaceLanguage } from "./config";
import { en } from "./en";
import type { Translations } from "./types";
import { vi } from "./vi";

export function getTranslations(locale: InterfaceLanguage): Translations {
  return locale === "vi" ? vi : en;
}

export function formatMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((message, [key, value]) => message.replaceAll(`{${key}}`, String(value)), template);
}
