import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { grammarSuggestion } from "@/lib/grammar/suggestions";

export function GrammarArticleSuggestion({ part, skill, subSkill, locale }: { part: number; skill: string; subSkill: string; locale: InterfaceLanguage }) {
  const suggestion = grammarSuggestion(part, skill, subSkill);
  if (!suggestion) return null;
  return <p className="mt-4 rounded-xl bg-teal-50 px-3 py-3 text-sm leading-6 text-teal-950">
    <span className="font-semibold">{locale === "vi" ? "Ôn lại ngữ pháp:" : "Grammar guide:"}</span>{" "}
    <Link className="font-bold text-teal-800 underline underline-offset-2 hover:text-teal-950" href={`/blog/${suggestion.slug}`}>{suggestion.title}</Link>
  </p>;
}
