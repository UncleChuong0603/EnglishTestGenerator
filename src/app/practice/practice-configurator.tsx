"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/runtime";
import { modeLabel, taxonomyLabel } from "@/lib/i18n/labels";
import { QUESTION_COUNT_OPTIONS, READING_TAXONOMY } from "@/lib/practice/constants";
import type { ReadingPart, ReadingPracticeMode } from "@/lib/practice/types";
import { startReadingPractice } from "./actions";

function SubmitButton({ locale }: { locale: InterfaceLanguage }) { const { pending } = useFormStatus(); const t = getTranslations(locale); return <button className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-60" disabled={pending} type="submit">{pending ? t.practiceConfig.building : t.practiceConfig.start}</button>; }
export function PracticeConfigurator({ locale }: { locale: InterfaceLanguage }) {
  const t = getTranslations(locale);
  const [mode, setMode] = useState<ReadingPracticeMode>("part_5");
  const [skill, setSkill] = useState("");
  const part = mode === "mixed_reading" ? null : Number(mode.slice(-1)) as ReadingPart;
  const skills = part ? Object.keys(READING_TAXONOMY[part]) : [];
  const subSkills = part && skill ? READING_TAXONOMY[part][skill] ?? [] : [];
  function changeMode(value: ReadingPracticeMode) { setMode(value); setSkill(""); }
  return <form action={startReadingPractice} className="mt-6 space-y-7"><input name="source" type="hidden" value="custom" /><fieldset><legend className="font-black">{t.practiceConfig.part}</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{(["part_5", "part_6", "part_7", "mixed_reading"] as const).map((value) => <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-slate-300 p-4 has-checked:border-teal-600 has-checked:bg-teal-50" key={value}><input checked={mode === value} name="mode" onChange={() => changeMode(value)} type="radio" value={value} /><span className="font-bold">{modeLabel(value, locale)}</span></label>)}</div></fieldset>
    {part ? <div className="grid gap-4 sm:grid-cols-2"><label className="font-bold">{t.practiceConfig.focus}<select className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal" name="skill" onChange={(event) => setSkill(event.target.value)} value={skill}><option value="">{t.practiceConfig.allSkills}</option>{skills.map((value) => <option key={value} value={value}>{taxonomyLabel(value, locale)}</option>)}</select></label><label className="font-bold">{t.practiceConfig.subskill}<select className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal disabled:bg-slate-100" disabled={!skill} name="subSkill" defaultValue=""><option value="">{t.practiceConfig.allSubskills}</option>{subSkills.map((value) => <option key={value} value={value}>{taxonomyLabel(value, locale)}</option>)}</select></label></div> : <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{t.practiceConfig.mixedInfo}</p>}
    <fieldset><legend className="font-black">{t.practiceConfig.target}</legend><div className="mt-3 grid grid-cols-3 gap-3">{QUESTION_COUNT_OPTIONS.map((count) => <label className="cursor-pointer rounded-xl border border-slate-300 p-4 text-center has-checked:border-teal-600 has-checked:bg-teal-50" key={count}><input className="sr-only" defaultChecked={count === 15} name="questionCount" type="radio" value={count} /><strong>{count}</strong></label>)}</div><p className="mt-2 text-sm text-slate-500">{t.practiceConfig.setsInfo}</p></fieldset><SubmitButton locale={locale} /></form>;
}
