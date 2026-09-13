"use client";

import { useLocale } from "@/components/locale-provider";
import { taxonomyLabel } from "@/lib/i18n/labels";
import { getTranslations } from "@/lib/i18n/runtime";
import type { PracticePassage } from "@/lib/practice/types";

export function PassageDocuments({ passages }: { passages: PracticePassage[] }) {
  const locale = useLocale();
  const t = getTranslations(locale);
  return <div className="space-y-4">{passages.map((passage, index) => <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50" key={passage.id}><header className="border-b border-slate-200 bg-slate-100 px-4 py-3"><p className="text-xs font-black uppercase tracking-wider text-slate-500">{t.common.document} {index + 1} · {taxonomyLabel(passage.documentType, locale)}</p>{passage.title ? <h2 className="mt-1 font-black" lang="en">{passage.title}</h2> : null}</header><div className="whitespace-pre-wrap break-words p-4 text-[15px] leading-7 text-slate-800 sm:p-5" lang="en">{passage.content}</div></article>)}</div>;
}
