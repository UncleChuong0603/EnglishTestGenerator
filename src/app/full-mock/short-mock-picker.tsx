"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import {
  SHORT_MOCK_DIFFICULTIES,
  type ShortMockDifficulty,
} from "@/lib/short-mock/config";
import { startShortMock } from "./actions";

type Props = {
  active: { id: string; difficulty: ShortMockDifficulty } | null;
  locale: InterfaceLanguage;
  readiness: Record<ShortMockDifficulty, boolean>;
};

const levels = {
  easy: {
    vi: { name: "Dễ", detail: "Củng cố nền tảng và làm quen nhịp đề." },
    en: { name: "Easy", detail: "Build foundations and settle into the test rhythm." },
    bars: 1,
  },
  medium: {
    vi: { name: "Vừa", detail: "Cân bằng tốc độ, từ vựng và ngữ pháp." },
    en: { name: "Medium", detail: "Balance pace, vocabulary, and grammar." },
    bars: 2,
  },
  hard: {
    vi: { name: "Khó", detail: "Thử sức với câu hỏi phân loại cao hơn." },
    en: { name: "Hard", detail: "Take on more demanding questions." },
    bars: 3,
  },
} as const;

function SubmitButton({ locale, disabled }: { locale: InterfaceLanguage; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-6 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      disabled={disabled || pending}
      type="submit"
    >
      {pending
        ? locale === "vi"
          ? "Đang tạo đề…"
          : "Building test…"
        : locale === "vi"
          ? "Bắt đầu đề ngắn"
          : "Start short mock"}
    </button>
  );
}

export function ShortMockPicker({ active, locale, readiness }: Props) {
  const vi = locale === "vi";
  const firstReady = SHORT_MOCK_DIFFICULTIES.find((difficulty) => readiness[difficulty]);
  if (active) {
    const level = levels[active.difficulty][locale];
    return (
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-teal-300 bg-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-teal-800">
            {vi ? "Đề ngắn đang làm" : "Short mock in progress"}
          </p>
          <p className="mt-1 text-lg font-black text-slate-900">
            {vi ? `Mức ${level.name} · 20 câu Part 5` : `${level.name} · 20 Part 5 questions`}
          </p>
        </div>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-6 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          href={`/practice/${active.id}`}
        >
          {vi ? "Tiếp tục làm bài" : "Continue test"}
        </Link>
      </div>
    );
  }

  return (
    <form action={startShortMock} className="mt-6">
      <fieldset>
        <legend className="sr-only">{vi ? "Chọn độ khó" : "Choose difficulty"}</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {SHORT_MOCK_DIFFICULTIES.map((difficulty) => {
            const level = levels[difficulty][locale];
            const ready = readiness[difficulty];
            return (
              <label
                className="group cursor-pointer rounded-2xl border border-slate-300 bg-white p-5 transition-colors has-checked:border-teal-700 has-checked:bg-teal-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-teal-700 has-disabled:cursor-not-allowed has-disabled:bg-slate-100 has-disabled:opacity-65"
                key={difficulty}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <input
                      className="accent-teal-700 focus-visible:outline-none"
                      defaultChecked={difficulty === (readiness.medium ? "medium" : firstReady)}
                      disabled={!ready}
                      name="difficulty"
                      type="radio"
                      value={difficulty}
                    />
                    <strong className="text-lg">{level.name}</strong>
                  </span>
                  <span aria-hidden="true" className="flex h-5 items-end gap-1 text-teal-700">
                    {[1, 2, 3].map((bar) => (
                      <span
                        className={`w-1.5 rounded-sm ${bar <= levels[difficulty].bars ? "bg-current" : "bg-slate-200"}`}
                        key={bar}
                        style={{ height: `${bar * 5 + 3}px` }}
                      />
                    ))}
                  </span>
                </span>
                <span className="mt-3 block text-sm leading-6 text-slate-600">{level.detail}</span>
                {!ready ? (
                  <span className="mt-3 block text-sm font-bold text-amber-800">
                    {vi ? "Đang bổ sung câu hỏi" : "More questions coming soon"}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-600">
          {vi
            ? "20 câu Part 5 · khoảng 12 phút · xem kết quả và lời giải sau khi nộp."
            : "20 Part 5 questions · about 12 minutes · results and explanations after submission."}
        </p>
        <SubmitButton disabled={!firstReady} locale={locale} />
      </div>
    </form>
  );
}
