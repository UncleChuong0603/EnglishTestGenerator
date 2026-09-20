"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";

export function AuthLanguageControl() {
  return <LanguageSwitcher locale={useLocale()} />;
}
