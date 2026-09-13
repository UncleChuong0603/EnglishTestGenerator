import { setInterfaceLanguage } from "@/app/settings/actions";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function LanguageSwitcher({ locale }: { locale: InterfaceLanguage }) {
  return <form action={setInterfaceLanguage} aria-label={locale === "vi" ? "Đổi ngôn ngữ giao diện" : "Change interface language"} className="inline-flex rounded-lg border border-slate-300 bg-white p-1 text-xs font-black">
    {(["en", "vi"] as const).map((language) => <button aria-pressed={locale === language} className={`rounded-md px-2.5 py-1.5 ${locale === language ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`} key={language} name="language" type="submit" value={language}>{language.toUpperCase()}</button>)}
  </form>;
}
