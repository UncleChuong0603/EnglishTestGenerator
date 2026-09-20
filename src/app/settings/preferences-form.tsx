"use client";

import { useActionState } from "react";

import type { ExplanationLanguage, InterfaceLanguage } from "@/lib/i18n/config";
import type { Translations } from "@/lib/i18n/types";
import { savePreferences, type PreferenceActionState } from "./actions";

const initialState: PreferenceActionState = { ok: false };

export function PreferencesForm({ preferences, t }: { preferences: { interfaceLanguage: InterfaceLanguage; explanationLanguage: ExplanationLanguage }; t: Translations }) {
  const [state, action, pending] = useActionState(savePreferences, initialState);
  return <form action={action} className="mt-6 space-y-7">
    <fieldset><legend className="font-bold">{t.language.interface}</legend><p className="mt-1 text-sm leading-6 text-slate-500">{t.settings.interfaceHelp}</p><div className="mt-3 flex flex-wrap gap-2">{(["en", "vi"] as const).map((value) => <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 has-checked:border-teal-600 has-checked:bg-teal-50" key={value}><input defaultChecked={preferences.interfaceLanguage === value} name="interfaceLanguage" type="radio" value={value} /><span className="font-semibold">{value === "en" ? t.language.english : t.language.vietnamese}</span></label>)}</div></fieldset>
    <fieldset><legend className="font-bold">{t.language.explanations}</legend><p className="mt-1 text-sm leading-6 text-slate-500">{t.settings.explanationHelp}</p><div className="mt-3 flex flex-wrap gap-2">{(["en", "vi", "both"] as const).map((value) => <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 has-checked:border-teal-600 has-checked:bg-teal-50" key={value}><input defaultChecked={preferences.explanationLanguage === value} name="explanationLanguage" type="radio" value={value} /><span className="font-semibold">{value === "en" ? t.language.english : value === "vi" ? t.language.vietnamese : t.language.both}</span></label>)}</div></fieldset>
    {state.error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{t.settings.error}</p> : state.ok ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{t.language.saved}</p> : null}
    <button className="min-h-12 w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-60 sm:w-auto" disabled={pending} type="submit">{pending ? t.language.saving : t.language.save}</button>
  </form>;
}
