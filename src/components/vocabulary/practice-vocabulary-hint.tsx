import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function PracticeVocabularyHint({ locale }: { locale: InterfaceLanguage }) {
  return <p className="my-3 text-sm leading-6 text-slate-600">
    {locale === "vi" ? "Rê chuột hoặc chạm vào từ để tra nghĩa và lưu flashcard. " : "Hover over or tap a word to look it up and save a flashcard. "}
    <Link className="font-bold text-teal-800 underline" href="/vocabulary">{locale === "vi" ? "Từ của tôi" : "My vocabulary"}</Link>
  </p>;
}
