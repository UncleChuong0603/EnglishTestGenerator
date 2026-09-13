"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { PassageDocuments } from "@/components/practice/passage-documents";
import { formatTimer, remainingSeconds } from "@/lib/demo-test/composition";
import type { DemoTestSession } from "@/lib/demo-test/types";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/runtime";
import type { PracticeQuestion } from "@/lib/practice/types";
import { saveDemoAnswer, submitDemoTest } from "../actions";

function Question({ question, selected, disabled, choose, locale }: { question: PracticeQuestion; selected?: string; disabled: boolean; choose: (optionId: string) => void; locale: InterfaceLanguage }) {
  const t = getTranslations(locale);
  return <section className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" id={`question-${question.number}`}>
    <p className="text-sm font-black text-teal-700">{t.practice.question} {question.number}</p><h2 className="mt-3 text-lg font-bold leading-7 sm:text-xl" lang="en">{question.text}</h2>
    <fieldset className="mt-5 space-y-3" disabled={disabled}><legend className="sr-only">{t.practice.chooseAnswer} {question.number}</legend>{question.options.map((option) => <label className={`flex min-h-14 cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${selected === option.id ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600" : "border-slate-200 hover:border-slate-400"}`} key={option.id}><input checked={selected === option.id} className="mt-1" name={`question-${question.id}`} onChange={() => choose(option.id)} type="radio" /><span lang="en"><strong className="mr-2">{option.key}.</strong>{option.text}</span></label>)}</fieldset>
  </section>;
}

export function DemoTestClient({ session, locale }: { session: DemoTestSession; locale: InterfaceLanguage }) {
  const t = getTranslations(locale); const router = useRouter();
  const [groupIndex, setGroupIndex] = useState(0); const [answers, setAnswers] = useState(session.answers);
  const [remaining, setRemaining] = useState(() => remainingSeconds(session.expiresAt));
  const [navigatorOpen, setNavigatorOpen] = useState(false); const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitError, setSubmitError] = useState(false); const [isPending, startTransition] = useTransition();
  const expirationStarted = useRef(false);
  const group = session.groups[groupIndex]; const answeredCount = Object.keys(answers).length;

  const finish = useCallback((reason: "manual" | "time_expired") => {
    if (isPending || (reason === "time_expired" && expirationStarted.current)) return;
    if (reason === "time_expired") expirationStarted.current = true;
    setConfirmOpen(false); setSubmitError(false);
    startTransition(async () => {
      const result = await submitDemoTest(session.id, reason);
      if (!result.ok) { expirationStarted.current = false; setSubmitError(true); return; }
      router.replace(`/demo-test/${session.id}/results`); router.refresh();
    });
  }, [isPending, router, session.id]);

  useEffect(() => {
    const tick = () => { const next = remainingSeconds(session.expiresAt); setRemaining(next); if (next === 0) finish("time_expired"); };
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer);
  }, [finish, session.expiresAt]);

  function move(index: number, questionNumber?: number) {
    setGroupIndex(index); setNavigatorOpen(false);
    window.setTimeout(() => document.getElementById(`question-${questionNumber ?? session.groups[index].questions[0].number}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  function choose(question: PracticeQuestion, optionId: string) {
    if (remaining === 0 || isPending) return;
    const previous = answers[question.id]; setAnswers((current) => ({ ...current, [question.id]: optionId })); setSaveState("saving");
    void saveDemoAnswer(session.id, question.id, optionId).then((result) => {
      if (!result.ok) { setAnswers((current) => previous ? ({ ...current, [question.id]: previous }) : Object.fromEntries(Object.entries(current).filter(([id]) => id !== question.id))); setSaveState("error"); if (result.error === "expired") finish("time_expired"); }
      else setSaveState("saved");
    });
  }
  const navigator = <div><div className="flex items-center justify-between"><h2 className="font-black">{t.demoTest.questionNavigator}</h2><button className="lg:hidden" onClick={() => setNavigatorOpen(false)} type="button">{t.demoTest.closeNavigator}</button></div>{([5, 6, 7] as const).map((part) => { const questions = session.questions.filter((question) => question.part === part); return <section className="mt-5" key={part}><p className="text-sm font-black">Part {part} <span className="font-normal text-slate-500">{questions[0].number}–{questions.at(-1)!.number}</span></p><div className="mt-2 grid grid-cols-5 gap-2">{questions.map((question) => { const index = session.groups.findIndex((item) => item.questions.some((candidate) => candidate.id === question.id)); const current = index === groupIndex; const answered = Boolean(answers[question.id]); return <button aria-label={`${t.practice.question} ${question.number}, ${answered ? t.demoTest.answered : t.demoTest.unanswered}${current ? `, ${t.demoTest.current}` : ""}`} className={`relative h-10 rounded-lg border text-sm font-bold ${current ? "border-slate-900 bg-slate-900 text-white" : answered ? "border-teal-500 bg-teal-50 text-teal-900" : "border-slate-300 bg-white"}`} key={question.id} onClick={() => move(index, question.number)} type="button">{question.number}{answered ? <span className="absolute right-1 top-0.5 text-[10px]" aria-hidden="true">✓</span> : null}</button>; })}</div></section>; })}</div>;

  return <main className="min-h-screen bg-slate-50 text-slate-900"><header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><div><p className="font-black">{t.demoTest.shortTitle}</p><p className="text-xs text-slate-500">Part {group.part} · {t.practice.question} {group.questions[0].number}/{session.questionCount}</p></div><div className={`rounded-xl px-4 py-2 text-right ${remaining <= 300 ? "bg-amber-50 text-amber-900" : "bg-slate-100"}`}><p className="text-xs font-bold uppercase tracking-wide">{t.demoTest.timeRemaining}</p><p className="font-mono text-xl font-black" aria-live="off">{formatTimer(remaining)}</p></div></div></header>
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_18rem]"><div className="min-w-0"><div className="flex flex-wrap items-center justify-between gap-3"><Link className="font-bold text-teal-700" href="/dashboard">{t.demoTest.leave}</Link><div className="flex items-center gap-3"><span className={`text-sm ${saveState === "error" ? "text-red-700" : "text-slate-500"}`}>{saveState === "saving" ? t.demoTest.saving : saveState === "saved" ? t.demoTest.saved : saveState === "error" ? t.demoTest.saveError : `${t.demoTest.answered} ${answeredCount}/100`}</span><button className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold lg:hidden" onClick={() => setNavigatorOpen(true)} type="button">{t.demoTest.openNavigator}</button></div></div>
    <div className={`mt-5 grid min-w-0 gap-5 ${group.passages.length ? "xl:grid-cols-2 xl:items-start" : "mx-auto max-w-3xl"}`}>{group.passages.length ? <div className="min-w-0 xl:sticky xl:top-24" lang="en"><PassageDocuments passages={group.passages} /></div> : null}<div className="space-y-4">{group.questions.map((question) => <Question choose={(optionId) => choose(question, optionId)} disabled={remaining === 0 || isPending} key={question.id} locale={locale} question={question} selected={answers[question.id]} />)}</div></div>
    {remaining === 0 ? <p className="mt-5 rounded-xl bg-amber-50 p-4 text-amber-900" role="status">{t.demoTest.expired}</p> : null}{submitError ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-800" role="alert">{t.demoTest.submitError}</p> : null}
    <div className="mt-6 flex flex-wrap justify-between gap-3 pb-12"><button className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold disabled:opacity-40" disabled={groupIndex === 0 || isPending} onClick={() => move(groupIndex - 1)} type="button">{t.practice.previousSet}</button>{groupIndex < session.groups.length - 1 ? <button className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white" disabled={isPending} onClick={() => move(groupIndex + 1)} type="button">{t.practice.nextSet}</button> : null}<button className="ml-auto rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50" disabled={remaining === 0 || isPending} onClick={() => setConfirmOpen(true)} type="button">{t.demoTest.submit}</button></div></div>
    <aside className="hidden rounded-2xl border border-slate-200 bg-white p-5 lg:block lg:self-start lg:sticky lg:top-24">{navigator}</aside></div>
    {navigatorOpen ? <div className="fixed inset-0 z-40 bg-slate-950/50 p-4 lg:hidden" onMouseDown={(event) => { if (event.target === event.currentTarget) setNavigatorOpen(false); }}><div className="ml-auto h-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5" role="dialog" aria-modal="true" aria-label={t.demoTest.questionNavigator}>{navigator}</div></div> : null}
    {confirmOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="submit-title"><h2 className="text-2xl font-black" id="submit-title">{t.demoTest.confirmTitle}</h2><dl className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3"><dt className="text-sm text-slate-500">{t.demoTest.answered}</dt><dd className="text-xl font-black">{answeredCount}/100</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-sm text-slate-500">{t.demoTest.unanswered}</dt><dd className="text-xl font-black">{100 - answeredCount}</dd></div><div className="col-span-2 rounded-xl bg-slate-50 p-3"><dt className="text-sm text-slate-500">{t.demoTest.timeRemaining}</dt><dd className="font-mono text-xl font-black">{formatTimer(remaining)}</dd></div></dl><p className="mt-4 text-slate-600">{t.demoTest.confirmBody}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><button className="rounded-xl border border-slate-300 px-4 py-3 font-bold" onClick={() => setConfirmOpen(false)} type="button">{t.demoTest.continueTest}</button><button className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white" onClick={() => finish("manual")} type="button">{isPending ? t.demoTest.submitting : t.demoTest.submit}</button></div></section></div> : null}
  </main>;
}
