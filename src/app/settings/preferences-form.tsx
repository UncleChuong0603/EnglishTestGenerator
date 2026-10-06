"use client";

import { useActionState } from "react";
import type { ExplanationLanguage, InterfaceLanguage } from "@/lib/i18n/config";
import type { Translations } from "@/lib/i18n/types";
import { savePreferences, type PreferenceActionState } from "./actions";

const initialState: PreferenceActionState = { ok: false };
const optionClass = "flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border border-[#cbd7cb] bg-white p-4 transition-colors hover:bg-[#f7faf6] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#245a43] has-checked:border-[#245a43] has-checked:bg-[#edf5ef]";

export function PreferencesForm({ preferences, t }: { preferences: { interfaceLanguage: InterfaceLanguage; explanationLanguage: ExplanationLanguage }; t: Translations }) {
  const [state, action, pending] = useActionState(savePreferences, initialState);
  const vi = preferences.interfaceLanguage === "vi";
  return (
    <form action={action} aria-busy={pending}>
      <div className="grid gap-8">
        <fieldset>
          <legend className="font-bold">{t.language.interface}</legend>
          <p className="mt-1 text-sm leading-6 text-[#52645a]">{t.settings.interfaceHelp}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["en", "vi"] as const).map((value) => <label className={optionClass} key={value}>
              <input className="mt-0.5 size-5 shrink-0 accent-[#245a43]" defaultChecked={preferences.interfaceLanguage === value} name="interfaceLanguage" type="radio" value={value} />
              <span><span className="block font-semibold">{value === "en" ? t.language.english : t.language.vietnamese}</span><span className="mt-1 block text-sm leading-5 text-[#52645a]">{value === "en" ? (vi ? "Hiển thị điều hướng và nội dung hệ thống bằng tiếng Anh." : "Show navigation and system content in English.") : (vi ? "Hiển thị điều hướng và nội dung hệ thống bằng tiếng Việt." : "Show navigation and system content in Vietnamese.")}</span></span>
            </label>)}
          </div>
        </fieldset>

        <fieldset className="border-t border-[#edf1eb] pt-7">
          <legend className="font-bold">{t.language.explanations}</legend>
          <p className="mt-1 text-sm leading-6 text-[#52645a]">{t.settings.explanationHelp}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(["en", "vi", "both"] as const).map((value) => <label className={optionClass} key={value}>
              <input className="mt-0.5 size-5 shrink-0 accent-[#245a43]" defaultChecked={preferences.explanationLanguage === value} name="explanationLanguage" type="radio" value={value} />
              <span className="font-semibold">{value === "en" ? t.language.english : value === "vi" ? t.language.vietnamese : t.language.both}</span>
            </label>)}
          </div>
        </fieldset>
      </div>
      {state.error ? <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">{t.settings.error}</p> : state.ok ? <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800" role="status">{t.language.saved}</p> : null}
      <div className="mt-7 border-t border-[#edf1eb] pt-6">
        <button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#245a43] px-5 py-3 font-bold text-white transition-colors hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto" disabled={pending} type="submit">{pending ? t.language.saving : t.language.save}</button>
      </div>
    </form>
  );
}
