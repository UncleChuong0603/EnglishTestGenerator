"use client";

import { useMemo, useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { summarizeToeicScore } from "@/lib/seo/toeic-score";

const copy = {
  vi: {
    title: "Cộng điểm Listening và Reading",
    intro: "Nhập hai điểm thành phần trên phiếu điểm hoặc kết quả thi thử có cùng thang 5–495. Công cụ chỉ cộng hai điểm scaled score; không đổi số câu đúng thành điểm ETS.",
    listening: "Điểm Listening",
    reading: "Điểm Reading",
    target: "Mục tiêu tổng",
    total: "Tổng điểm",
    reached: "Bạn đã đạt hoặc vượt mục tiêu đã nhập.",
    gap: (value: number) => `Còn ${value} điểm để tới mục tiêu. Dùng chênh lệch theo từng kỹ năng để chọn phần cần luyện trước.`,
    invalid: "Listening và Reading phải từ 5 đến 495; mục tiêu tổng phải từ 10 đến 990.",
  },
  en: {
    title: "Add Listening and Reading scores",
    intro: "Enter the two section scores shown on a score report or a practice result using the same 5–495 scale. This tool only adds scaled scores; it does not convert correct answers into an ETS score.",
    listening: "Listening score",
    reading: "Reading score",
    target: "Total target",
    total: "Total score",
    reached: "You have reached or exceeded the target entered.",
    gap: (value: number) => `${value} points remain to reach the target. Compare the two section scores to choose what to practice first.`,
    invalid: "Listening and Reading must be between 5 and 495; the total target must be between 10 and 990.",
  },
} as const;

export function ToeicScoreCalculator({ locale }: { locale: InterfaceLanguage }) {
  const t = copy[locale];
  const [listening, setListening] = useState("350");
  const [reading, setReading] = useState("300");
  const [target, setTarget] = useState("700");
  const summary = useMemo(() => summarizeToeicScore(Number(listening), Number(reading), Number(target)), [listening, reading, target]);
  const inputClass = "mt-2 min-h-12 w-full rounded-md border border-[#9fb1a4] bg-white px-4 text-lg font-bold tabular-nums text-[#172821] outline-offset-2 focus-visible:outline-3 focus-visible:outline-[#245a43]";

  return <section aria-labelledby="score-calculator-title" className="rounded-2xl border border-[#a9cbb5] bg-[#e7eee8] p-5 sm:p-8">
    <h2 className="text-2xl font-black" id="score-calculator-title">{t.title}</h2>
    <p className="mt-3 max-w-3xl leading-7 text-[#45584d]">{t.intro}</p>
    <div className="mt-6 grid gap-5 sm:grid-cols-3">
      <label className="font-bold">{t.listening}<input className={inputClass} inputMode="numeric" max={495} min={5} onChange={(event) => setListening(event.target.value)} type="number" value={listening} /></label>
      <label className="font-bold">{t.reading}<input className={inputClass} inputMode="numeric" max={495} min={5} onChange={(event) => setReading(event.target.value)} type="number" value={reading} /></label>
      <label className="font-bold">{t.target}<input className={inputClass} inputMode="numeric" max={990} min={10} onChange={(event) => setTarget(event.target.value)} type="number" value={target} /></label>
    </div>
    <div aria-live="polite" className="mt-6 rounded-xl bg-[#172821] p-5 text-white">
      {summary ? <><p className="text-sm font-bold uppercase tracking-[.12em] text-[#bfe5c9]">{t.total}</p><p className="mt-1 text-4xl font-black tabular-nums">{summary.total}<span className="ml-1 text-lg font-bold text-[#dce3d9]">/ 990</span></p><p className="mt-3 leading-7 text-[#e7eee8]">{summary.reachedTarget ? t.reached : t.gap(summary.gap)}</p></> : <p className="font-bold text-amber-200">{t.invalid}</p>}
    </div>
  </section>;
}
