"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { MockDifficulty, MockFormCatalogEntry } from "@/lib/full-mock/service";
import type { MockMode } from "@/lib/full-mock/blueprint";
import { startMock } from "./actions";

type ActiveMock = { id: string; formNumber: number | null } | null;

type Props = {
  actives: Record<MockMode, ActiveMock>;
  catalog: MockFormCatalogEntry[];
  locale: InterfaceLanguage;
  signedIn: boolean;
};

const modes: Array<{ mode: MockMode; questions: number; minutes: number; parts: string }> = [
  { mode: "FULL", questions: 200, minutes: 120, parts: "1–7" },
  { mode: "LISTENING", questions: 100, minutes: 45, parts: "1–4" },
  { mode: "READING", questions: 100, minutes: 75, parts: "5–7" },
];

const difficultyStyles: Record<MockDifficulty, string> = {
  easy: "border-emerald-300 bg-emerald-50 text-emerald-900",
  medium: "border-amber-300 bg-amber-50 text-amber-950",
  hard: "border-rose-300 bg-rose-50 text-rose-900",
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function StartButton({ disabled, label, pendingLabel }: { disabled?: boolean; label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-65 sm:w-auto"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
      {!pending ? <ArrowIcon /> : null}
    </button>
  );
}

function modeName(mode: MockMode) {
  return mode === "FULL" ? "Full Mock" : mode === "LISTENING" ? "Listening Mock" : "Reading Mock";
}

export function MockFormPicker({ actives, catalog, locale, signedIn }: Props) {
  const vi = locale === "vi";
  const [mode, setMode] = useState<MockMode>("FULL");
  const [filter, setFilter] = useState<MockDifficulty | "all">("all");
  const firstReady = catalog.find((entry) => entry.ready)?.formNumber ?? 1;
  const [selected, setSelected] = useState<Record<MockMode, number>>({ FULL: firstReady, LISTENING: firstReady, READING: firstReady });
  const active = actives[mode];
  const visibleForms = useMemo(
    () => catalog.filter((entry) => filter === "all" || entry.difficulty[mode] === filter),
    [catalog, filter, mode],
  );
  const selectedEntry = catalog.find((entry) => entry.formNumber === selected[mode]);
  const difficultyNames: Record<MockDifficulty, string> = vi
    ? { easy: "Dễ", medium: "Vừa", hard: "Khó" }
    : { easy: "Easy", medium: "Medium", hard: "Hard" };

  const picker = (
    <>
      {signedIn ? <input name="formNumber" type="hidden" value={selected[mode]} /> : null}
      <div className="grid gap-2 rounded-2xl bg-slate-100 p-2 md:grid-cols-3" role="tablist" aria-label={vi ? "Chọn chế độ thi" : "Choose mock mode"}>
        {modes.map((item) => {
          const chosen = item.mode === mode;
          return (
            <button
              aria-controls="mock-form-panel"
              aria-selected={chosen}
              className={`min-h-16 rounded-xl px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${chosen ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
              id={`mock-mode-${item.mode.toLowerCase()}`}
              key={item.mode}
              onClick={() => { setMode(item.mode); setFilter("all"); }}
              onKeyDown={(event) => {
                const current = modes.findIndex((candidate) => candidate.mode === item.mode);
                const next = event.key === "ArrowRight" || event.key === "ArrowDown"
                  ? (current + 1) % modes.length
                  : event.key === "ArrowLeft" || event.key === "ArrowUp"
                    ? (current - 1 + modes.length) % modes.length
                    : event.key === "Home" ? 0 : event.key === "End" ? modes.length - 1 : -1;
                if (next < 0) return;
                event.preventDefault();
                setMode(modes[next].mode);
                setFilter("all");
                document.getElementById(`mock-mode-${modes[next].mode.toLowerCase()}`)?.focus();
              }}
              role="tab"
              tabIndex={chosen ? 0 : -1}
              type="button"
            >
              <span className="block font-black">{modeName(item.mode)}</span>
              <span className={`mt-1 block text-xs font-bold ${chosen ? "text-slate-900" : "text-slate-500"}`}>
                {item.questions} {vi ? "câu" : "questions"} · {item.minutes} {vi ? "phút" : "minutes"} · Part {item.parts}
              </span>
            </button>
          );
        })}
      </div>

      <div aria-labelledby={`mock-mode-${mode.toLowerCase()}`} className="mt-6" id="mock-form-panel" role="tabpanel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-black">{vi ? `Chọn bộ đề ${modeName(mode)}` : `Choose a ${modeName(mode)} form`}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {vi ? "Độ khó được xếp tương đối theo câu hỏi trong từng chế độ." : "Difficulty is ranked relative to the questions in each mode."}
            </p>
          </div>
          <div aria-label={vi ? "Lọc theo độ khó" : "Filter by difficulty"} className="flex flex-wrap gap-2">
            {(["all", "easy", "medium", "hard"] as const).map((value) => (
              <button
                aria-pressed={filter === value}
                className={`min-h-11 rounded-full border px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${filter === value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"}`}
                key={value}
                onClick={() => setFilter(value)}
                type="button"
              >
                {value === "all" ? (vi ? "Tất cả" : "All") : difficultyNames[value]}
              </button>
            ))}
          </div>
        </div>

        {active ? (
          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-teal-300 bg-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between" role="status">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-teal-800">{vi ? "Bài đang làm" : "In progress"}</p>
              <p className="mt-1 font-bold text-slate-900">
                {modeName(mode)}{active.formNumber ? ` · ${vi ? "Đề" : "Form"} ${String(active.formNumber).padStart(2, "0")}` : ""}
              </p>
              <p className="mt-1 text-sm text-slate-600">{vi ? "Hoàn thành bài này trước khi bắt đầu một bộ đề khác cùng chế độ." : "Finish this attempt before starting another form in the same mode."}</p>
            </div>
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={`/full-mock/${active.id}`}>
              {vi ? "Tiếp tục làm bài" : "Continue test"}<ArrowIcon />
            </Link>
          </div>
        ) : null}

        <fieldset className="mt-5" disabled={Boolean(active)}>
          <legend className="sr-only">{vi ? "Danh sách bộ đề" : "Mock form list"}</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visibleForms.map((entry) => {
              const chosen = selected[mode] === entry.formNumber;
              const difficulty = entry.difficulty[mode];
              return (
                <label
                  className={`relative min-h-32 rounded-2xl border p-4 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-700 ${entry.ready ? "cursor-pointer bg-white hover:border-teal-500" : "cursor-not-allowed border-slate-200 bg-slate-100 opacity-65"} ${chosen && entry.ready ? "border-teal-700 ring-1 ring-teal-700" : "border-slate-300"}`}
                  key={entry.formNumber}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{vi ? "Bộ đề" : "Form"}</span>
                      <strong className="mt-1 block text-2xl tabular-nums text-slate-900">{String(entry.formNumber).padStart(2, "0")}</strong>
                    </span>
                    <input
                      checked={chosen}
                      className="mt-1 size-4 accent-teal-700"
                      disabled={!entry.ready || Boolean(active)}
                      name="mockFormChoice"
                      onChange={() => setSelected((current) => ({ ...current, [mode]: entry.formNumber }))}
                      type="radio"
                      value={entry.formNumber}
                    />
                  </span>
                  <span className={`mt-4 inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${difficultyStyles[difficulty]}`}>
                    {difficultyNames[difficulty]}
                  </span>
                  {!entry.ready ? <span className="mt-2 block text-xs font-bold text-slate-600">{vi ? "Đang bổ sung" : "Coming soon"}</span> : null}
                </label>
              );
            })}
          </div>
          {visibleForms.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600" role="status">
              {vi ? "Chưa có bộ đề ở mức này. Hãy chọn mức độ khác." : "No forms are available at this level yet. Choose another difficulty."}
            </p>
          ) : null}
        </fieldset>

        {!active ? (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div aria-live="polite">
              <p className="font-black text-slate-900">
                {vi ? "Bạn đã chọn" : "Your selection"}: {modeName(mode)} · {vi ? "Đề" : "Form"} {String(selected[mode]).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedEntry?.ready
                  ? `${difficultyNames[selectedEntry.difficulty[mode]]} · ${modes.find((item) => item.mode === mode)?.minutes} ${vi ? "phút" : "minutes"}`
                  : vi ? "Bộ đề này chưa sẵn sàng." : "This form is not ready yet."}
              </p>
            </div>
            {signedIn ? (
              <StartButton
                disabled={!selectedEntry?.ready}
                label={vi ? "Bắt đầu bộ đề này" : "Start this form"}
                pendingLabel={vi ? "Đang tạo đề…" : "Building test…"}
              />
            ) : (
              <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto" href="/sign-in?next=%2Ffull-mock">
                {vi ? "Đăng nhập để thi thử" : "Sign in to take a mock"}<ArrowIcon />
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </>
  );

  return signedIn && !active ? (
    <form action={startMock.bind(null, mode)}>{picker}</form>
  ) : (
    <div>{picker}</div>
  );
}
