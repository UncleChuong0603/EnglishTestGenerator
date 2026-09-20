"use client";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/runtime";
import type { PracticeQuestion } from "@/lib/practice/types";

export function QuestionBlock({ question, selectedId, onChoose, locale }: { question: PracticeQuestion; selectedId?: string; onChoose: (id: string) => void; locale: InterfaceLanguage }) {
  const t = getTranslations(locale);
  return <section className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" id={`question-${question.number}`}><p className="text-sm font-black text-teal-700">{t.practice.question} {question.number}</p><h2 className="mt-3 text-lg font-bold leading-8 sm:text-xl" lang="en">{question.text}</h2><fieldset className="mt-5 space-y-3"><legend className="sr-only">{t.practice.chooseAnswer} {question.number}</legend>{question.options.map((option) => { const selected = selectedId === option.id; return <label className={`group flex min-h-14 cursor-pointer items-center gap-4 rounded-xl border p-4 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-700 ${selected ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700" : "border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50"}`} key={option.id}><input checked={selected} className="h-5 w-5 shrink-0 accent-teal-700" name={`question-${question.id}`} onChange={() => onChoose(option.id)} type="radio" /><span className="break-words leading-6" lang="en"><strong className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-sm group-has-[:checked]:border-teal-700 group-has-[:checked]:bg-teal-700 group-has-[:checked]:text-white">{option.key}</strong>{option.text}</span></label>; })}</fieldset></section>;
}


