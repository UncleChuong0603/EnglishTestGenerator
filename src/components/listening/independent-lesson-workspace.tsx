"use client";
/* Static original SVG illustrations are served from the public directory. */
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { IndependentLesson } from "@/lib/listening-lessons/independent";

export function IndependentLessonWorkspace({ lesson, locale }: { lesson: IndependentLesson; locale: InterfaceLanguage }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(lesson.questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const vi = locale === "vi";
  const correct = answers.filter((answer, index) => answer === lesson.questions[index].answerIndex).length;

  return <div className="mt-7 grid gap-6 lg:grid-cols-2">
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="text-xl font-black">{vi ? "Nghe và trả lời" : "Listen and answer"}</h2>
      <p className="mt-2 text-sm text-slate-600">{vi ? "Nghe trước, chọn đáp án, rồi kiểm tra và mở transcript." : "Listen first, choose your answers, then check and open the transcript."}</p>
      {lesson.imageUrl && <img alt={vi ? lesson.imageAltVi ?? "" : lesson.imageAltEn ?? ""} className="mt-5 w-full rounded-2xl border bg-slate-50 object-contain" height="450" src={lesson.imageUrl} width="800" />}
      <audio aria-label={vi ? "Audio bài luyện nghe" : "Listening exercise audio"} className="mt-5 w-full" controls preload="metadata" ref={audio} src={lesson.audioUrl} />
      <label className="mt-4 flex items-center gap-3 text-sm font-semibold">{vi ? "Tốc độ" : "Speed"}<select className="rounded-lg border px-3 py-2" onChange={event => { const value = Number(event.target.value); setSpeed(value); if (audio.current) audio.current.playbackRate = value; }} value={speed}>{[0.75, 1, 1.25].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>
      <div className="mt-7 space-y-6">{lesson.questions.map((question, index) => <fieldset className="border-t pt-5" key={question.prompt}>
        <legend className="font-bold">{index + 1}. {question.prompt}</legend>
        <div className="mt-3 space-y-2">{question.options.map((option, optionIndex) => <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-3 ${checked && optionIndex === question.answerIndex ? "border-teal-600 bg-teal-50" : checked && optionIndex === answers[index] ? "border-red-400 bg-red-50" : "border-slate-200"}`} key={option}>
          <input checked={answers[index] === optionIndex} disabled={checked} name={`question-${index}`} onChange={() => setAnswers(current => current.map((answer, answerIndex) => answerIndex === index ? optionIndex : answer))} type="radio" value={optionIndex} />
          <span lang="en">{option}</span>
        </label>)}</div>
        {checked && <p className={`mt-3 text-sm font-semibold ${answers[index] === question.answerIndex ? "text-teal-800" : "text-red-700"}`}>{answers[index] === question.answerIndex ? (vi ? "Đúng." : "Correct.") : (vi ? "Chưa đúng." : "Not quite.")} {vi ? question.explanationVi : question.explanationEn}</p>}
      </fieldset>)}</div>
      <div className="mt-6 flex flex-wrap items-center gap-3"><button className="min-h-11 rounded-xl bg-teal-800 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={checked || answers.some(answer => answer === null)} onClick={() => setChecked(true)} type="button">{vi ? "Kiểm tra đáp án" : "Check answers"}</button>{checked && <button className="min-h-11 rounded-xl border border-teal-700 px-5 font-bold text-teal-800" onClick={() => { setAnswers(lesson.questions.map(() => null)); setChecked(false); setShowTranscript(false); }} type="button">{vi ? "Làm lại" : "Try again"}</button>}</div>
      {checked && <p aria-live="polite" className="mt-4 font-bold">{vi ? `Bạn đúng ${correct}/${lesson.questions.length} câu.` : `${correct}/${lesson.questions.length} correct.`}</p>}
    </section>
    <section className="self-start rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" aria-label="Transcript">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Transcript</h2><button aria-expanded={showTranscript} className="min-h-11 rounded-xl border border-teal-700 px-4 font-bold text-teal-800" onClick={() => setShowTranscript(value => !value)} type="button">{showTranscript ? (vi ? "Ẩn transcript" : "Hide transcript") : (vi ? "Hiện transcript" : "Show transcript")}</button></div>
      {showTranscript ? <p className="mt-5 whitespace-pre-line leading-8" lang="en">{lesson.transcript}</p> : <p className="mt-5 rounded-xl bg-slate-50 p-5 text-slate-600">{vi ? "Transcript đang ẩn để bạn tập trung nghe." : "The transcript is hidden so you can focus on listening."}</p>}
    </section>
  </div>;
}
