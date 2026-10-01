"use client";

import { useState, type ReactNode } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";

type ReviewFilter = "all" | "incorrect" | "correct";
type ReviewItem = { id: string; number: number; isCorrect: boolean };

export function ResultReview({ children, items, locale, defaultFilter = "all" }: {
  children: ReactNode;
  items: ReviewItem[];
  locale: InterfaceLanguage;
  defaultFilter?: ReviewFilter;
}) {
  const [filter, setFilter] = useState<ReviewFilter>(defaultFilter);
  const correct = items.filter((item) => item.isCorrect).length;
  const counts = { all: items.length, correct, incorrect: items.length - correct };
  const labels = locale === "vi"
    ? { all: "Tất cả", correct: "Đúng", incorrect: "Sai", filter: "Lọc câu trả lời", showing: "Đang hiển thị", jump: "Đi đến câu" }
    : { all: "All", correct: "Correct", incorrect: "Incorrect", filter: "Filter answers", showing: "Showing", jump: "Jump to question" };
  const visible = items.filter((item) => filter === "all" || (filter === "correct" ? item.isCorrect : !item.isCorrect));

  return <section className="result-review" data-review-filter={filter}>
    <div className="sticky top-2 z-20 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div aria-label={labels.filter} className="flex min-w-0 gap-1 rounded-xl bg-slate-100 p-1" role="group">
          {(["incorrect", "all", "correct"] as const).map((value) => <button aria-pressed={filter === value} className={`min-h-11 rounded-lg px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${filter === value ? "bg-white text-teal-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`} key={value} onClick={() => setFilter(value)} type="button">{labels[value]} <span aria-hidden="true">{counts[value]}</span></button>)}
        </div>
        <p aria-live="polite" className="text-sm font-semibold text-slate-600"><span className="sr-only">{labels.showing}: </span>{visible.length}/{items.length}</p>
      </div>
      {visible.length ? <nav aria-label={labels.jump} className="mt-3 overflow-x-auto pb-1"><div className="flex w-max min-w-full gap-2 sm:w-full sm:flex-wrap">{visible.map((item) => <a aria-label={`${labels.jump} ${item.number}`} className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg border text-sm font-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${item.isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`} href={`#review-question-${item.number}`} key={item.id}>{item.number}<span aria-hidden="true" className="ml-1">{item.isCorrect ? "✓" : "✕"}</span></a>)}</div></nav> : null}
    </div>
    {children}
  </section>;
}
