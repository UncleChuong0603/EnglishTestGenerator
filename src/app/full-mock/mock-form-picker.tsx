"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { MockMode } from "@/lib/full-mock/blueprint";
import type { MockDifficulty, MockFormCatalogEntry } from "@/lib/full-mock/service";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { startMock } from "./actions";
import { MockAuthDialog } from "./mock-auth-dialog";

type ActiveMock = { id: string; formNumber: number | null } | null;

type Props = {
  actives: Record<MockMode, ActiveMock>;
  catalog: MockFormCatalogEntry[];
  locale: InterfaceLanguage;
  signedIn: boolean;
};

type ModeMeta = {
  mode: MockMode;
  questions: number;
  minutes: number;
  parts: string;
  accent: string;
};

const modes: ModeMeta[] = [
  { mode: "FULL", questions: 200, minutes: 120, parts: "1–7", accent: "bg-teal-300 text-[#073138]" },
  { mode: "LISTENING", questions: 100, minutes: 45, parts: "1–4", accent: "bg-sky-300 text-sky-950" },
  { mode: "READING", questions: 100, minutes: 75, parts: "5–7", accent: "bg-amber-300 text-amber-950" },
];

const difficultyStyles: Record<MockDifficulty, string> = {
  easy: "border-emerald-300/40 bg-emerald-400/15 text-emerald-200",
  medium: "border-amber-300/40 bg-amber-400/15 text-amber-200",
  hard: "border-rose-300/40 bg-rose-400/15 text-rose-200",
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CollectionIcon({ mode }: { mode: MockMode }) {
  if (mode === "LISTENING") {
    return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h2a2 2 0 0 1 2 2v3H6a2 2 0 0 1-2-2v-3Zm16 0h-2a2 2 0 0 0-2 2v3h2a2 2 0 0 0 2-2v-3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
  }
  return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Zm16 0A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function TestIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20"><path d="M6 2.75h6l3 3V17.25H6V2.75Zm6 0v3h3M8.5 9h4M8.5 12h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
}

function ClockIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M10 6.5V10l2.5 1.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /></svg>;
}

function StartButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-2.5 text-sm font-black text-[#073138] transition-colors hover:bg-teal-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
      {!pending ? <ArrowIcon /> : null}
    </button>
  );
}

function modeName(mode: MockMode, locale: InterfaceLanguage) {
  const names = {
    FULL: locale === "vi" ? "Thi thử Full TOEIC" : "Full TOEIC Mock",
    LISTENING: locale === "vi" ? "Thi thử Listening" : "Listening Mock",
    READING: locale === "vi" ? "Thi thử Reading" : "Reading Mock",
  };
  return names[mode];
}

export function MockFormPicker({ actives, catalog, locale, signedIn }: Props) {
  const vi = locale === "vi";
  const [mode, setMode] = useState<MockMode>("FULL");
  const [filter, setFilter] = useState<MockDifficulty | "all">("all");
  const meta = modes.find((item) => item.mode === mode)!;
  const active = actives[mode];
  const readyCount = catalog.filter((entry) => entry.ready).length;
  const visibleForms = useMemo(
    () => catalog.filter((entry) => filter === "all" || entry.difficulty[mode] === filter),
    [catalog, filter, mode],
  );
  const difficultyNames: Record<MockDifficulty, string> = vi
    ? { easy: "Dễ", medium: "Vừa", hard: "Khó" }
    : { easy: "Easy", medium: "Medium", hard: "Hard" };

  const selectMode = (nextMode: MockMode) => {
    setMode(nextMode);
    setFilter("all");
  };

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3" role="tablist" aria-label={vi ? "Chọn bộ đề thi thử" : "Choose a mock collection"}>
        {modes.map((item) => {
          const chosen = item.mode === mode;
          return (
            <button
              aria-controls="mock-collection-panel"
              aria-selected={chosen}
              className={`group min-h-32 rounded-2xl border p-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 ${chosen ? "border-teal-300 bg-[#0d4249] shadow-[0_12px_30px_rgba(0,0,0,.16)]" : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]"}`}
              id={`mock-mode-${item.mode.toLowerCase()}`}
              key={item.mode}
              onClick={() => selectMode(item.mode)}
              onKeyDown={(event) => {
                const current = modes.findIndex((candidate) => candidate.mode === item.mode);
                const next = event.key === "ArrowRight" || event.key === "ArrowDown"
                  ? (current + 1) % modes.length
                  : event.key === "ArrowLeft" || event.key === "ArrowUp"
                    ? (current - 1 + modes.length) % modes.length
                    : event.key === "Home" ? 0 : event.key === "End" ? modes.length - 1 : -1;
                if (next < 0) return;
                event.preventDefault();
                selectMode(modes[next].mode);
                document.getElementById(`mock-mode-${modes[next].mode.toLowerCase()}`)?.focus();
              }}
              role="tab"
              tabIndex={chosen ? 0 : -1}
              type="button"
            >
              <span className="flex items-start justify-between gap-4">
                <span>
                  <span className="block text-lg font-black text-white">{modeName(item.mode, locale)}</span>
                  <span className="mt-1 block text-xs font-bold text-slate-400">{vi ? `${readyCount} đề sẵn sàng` : `${readyCount} forms ready`}</span>
                </span>
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${item.accent}`}><CollectionIcon mode={item.mode} /></span>
              </span>
              <span className="mt-4 block text-xs font-semibold text-slate-300">
                {item.questions} {vi ? "câu" : "questions"} · {item.minutes} {vi ? "phút" : "minutes"} · Part {item.parts}
              </span>
            </button>
          );
        })}
      </div>

      <section aria-labelledby={`mock-mode-${mode.toLowerCase()}`} className="mt-5" id="mock-collection-panel" role="tabpanel">
        <div className="relative overflow-hidden rounded-[24px] border border-teal-300/25 bg-gradient-to-br from-[#12616a] via-[#0d4c54] to-[#092f35] px-5 py-7 sm:px-8 sm:py-8">
          <div aria-hidden="true" className="absolute -right-16 -top-24 size-72 rounded-full border-[42px] border-white/[0.04]" />
          <div className="relative max-w-2xl">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#e4fff4] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#073138]">TOEIC GYM ORIGINAL</span>
              <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-black text-teal-100">2026</span>
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">{modeName(mode, locale)}</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50/80">
              {vi
                ? "Tự chọn đề phù hợp với mục tiêu hôm nay. Mỗi bài giữ đúng số câu và thời lượng của chế độ bạn chọn."
                : "Choose the form that fits today's goal. Every test keeps the correct question count and timing for your selected mode."}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white">
              <span className="inline-flex items-center gap-2"><TestIcon />{readyCount} {vi ? "đề" : "forms"}</span>
              <span className="inline-flex items-center gap-2"><ClockIcon />{meta.minutes} {vi ? "phút" : "minutes"}</span>
              <span>Part {meta.parts}</span>
            </div>
          </div>
        </div>

        {active ? (
          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-teal-300/35 bg-teal-300/10 p-5 sm:flex-row sm:items-center sm:justify-between" role="status">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-200">{vi ? "Bài đang làm" : "In progress"}</p>
              <p className="mt-1 font-black text-white">
                {modeName(mode, locale)}{active.formNumber ? ` · ${vi ? "Đề" : "Form"} ${String(active.formNumber).padStart(2, "0")}` : ""}
              </p>
              <p className="mt-1 text-sm text-slate-300">{vi ? "Hoàn thành bài này trước khi bắt đầu một đề khác cùng chế độ." : "Finish this attempt before starting another form in the same mode."}</p>
            </div>
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-2.5 text-sm font-black text-[#073138] hover:bg-teal-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300" href={`/full-mock/${active.id}`}>
              {vi ? "Tiếp tục làm bài" : "Continue test"}<ArrowIcon />
            </Link>
          </div>
        ) : null}

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">{vi ? "Danh sách đề" : "Test list"}</p>
            <h4 className="mt-1 text-xl font-black text-white">{vi ? "Chọn đề bạn muốn thi" : "Choose your test form"}</h4>
          </div>
          <div aria-label={vi ? "Lọc theo độ khó" : "Filter by difficulty"} className="flex flex-wrap gap-2">
            {(["all", "easy", "medium", "hard"] as const).map((value) => (
              <button
                aria-pressed={filter === value}
                className={`min-h-10 rounded-full border px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 ${filter === value ? "border-teal-300 bg-teal-300 text-[#073138]" : "border-white/15 bg-white/[0.04] text-slate-300 hover:border-white/30 hover:text-white"}`}
                key={value}
                onClick={() => setFilter(value)}
                type="button"
              >
                {value === "all" ? (vi ? "Tất cả" : "All") : difficultyNames[value]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {visibleForms.map((entry) => {
            const difficulty = entry.difficulty[mode];
            const formLabel = `${modeName(mode, locale)} · ${vi ? "Đề" : "Form"} ${String(entry.formNumber).padStart(2, "0")}`;
            const context = vi ? `${modeName(mode, locale)}, Đề ${String(entry.formNumber).padStart(2, "0")}` : `${modeName(mode, locale)}, Form ${String(entry.formNumber).padStart(2, "0")}`;
            return (
              <article className={`rounded-2xl border p-4 transition-colors sm:p-5 ${entry.ready ? "border-white/10 bg-white/[0.04] hover:border-teal-300/35" : "border-white/[0.06] bg-white/[0.025] opacity-65"}`} key={entry.formNumber}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-black text-white">{formLabel}</h5>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${difficultyStyles[difficulty]}`}>{difficultyNames[difficulty]}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-400">
                      <span className="inline-flex items-center gap-1.5"><TestIcon />{meta.questions} {vi ? "câu hỏi" : "questions"}</span>
                      <span className="inline-flex items-center gap-1.5"><ClockIcon />{meta.minutes} {vi ? "phút" : "minutes"}</span>
                      <span>Part {meta.parts}</span>
                    </div>
                  </div>

                  {entry.ready && !active ? (
                    signedIn ? (
                      <form action={startMock.bind(null, mode)}>
                        <input name="formNumber" type="hidden" value={entry.formNumber} />
                        <StartButton label={vi ? "Thi đề này" : "Take test"} pendingLabel={vi ? "Đang tạo đề…" : "Building test…"} />
                      </form>
                    ) : (
                      <MockAuthDialog
                        context={context}
                        locale={locale}
                        triggerClassName="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-teal-300/45 px-4 py-2.5 text-sm font-black text-teal-200 transition-colors hover:border-teal-300 hover:bg-teal-300 hover:text-[#073138] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 sm:w-auto"
                        triggerLabel={vi ? "Thi thử" : "Take test"}
                      />
                    )
                  ) : entry.ready ? (
                    <span className="text-xs font-bold text-slate-500">{vi ? "Đang có bài thi" : "Test in progress"}</span>
                  ) : (
                    <span className="rounded-full bg-white/[0.06] px-3 py-2 text-xs font-bold text-slate-400">{vi ? "Đang bổ sung" : "Coming soon"}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {visibleForms.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-6 text-slate-300" role="status">
            {vi ? "Chưa có đề ở mức này. Hãy chọn mức độ khác." : "No forms are available at this level yet. Choose another difficulty."}
          </p>
        ) : null}
      </section>
    </div>
  );
}
