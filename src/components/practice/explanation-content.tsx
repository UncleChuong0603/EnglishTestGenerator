import type { ExplanationLanguage, InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/runtime";

export function ExplanationContent({
  explanationEn,
  explanationLanguage,
  explanationVi,
  locale,
}: {
  explanationEn: string | null;
  explanationLanguage: ExplanationLanguage;
  explanationVi: string | null;
  locale: InterfaceLanguage;
}) {
  const t = getTranslations(locale);
  return (
    <div className="space-y-4 text-sm leading-6 text-slate-600">
      {explanationLanguage !== "vi" ? (
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            {explanationLanguage === "both" ? "EN" : t.results.explanation}
          </p>
          <p className="mt-1" lang="en">{explanationEn ?? t.results.noEnglish}</p>
        </div>
      ) : null}
      {explanationLanguage !== "en" ? (
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            {explanationLanguage === "both" ? "VI" : t.results.explanation}
          </p>
          <p className="mt-1" lang="vi">{explanationVi ?? t.results.noVietnamese}</p>
        </div>
      ) : null}
    </div>
  );
}
