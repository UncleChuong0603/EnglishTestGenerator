"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { ListeningSample } from "@/lib/seo/listening-samples";

export function ListeningSampleQuiz({ sample, locale = "vi" }: { sample: ListeningSample; locale?: "vi" | "en" }) {
  const id = useId();
  const firstOptions = useRef<(HTMLInputElement | null)[]>([]);
  const explanations = useRef<(HTMLDetailsElement | null)[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>(sample.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [incomplete, setIncomplete] = useState(false);
  const vi = locale === "vi";
  const score = sample.questions.reduce((total, question, index) => total + Number(answers[index] === question.answer), 0);

  function submit() {
    const missing = answers.findIndex(answer => answer === null);
    if (missing !== -1) {
      setIncomplete(true);
      firstOptions.current[missing]?.focus();
      return;
    }
    setIncomplete(false);
    setSubmitted(true);
    explanations.current.forEach(detail => { if (detail) detail.open = true; });
  }

  function reset() {
    setAnswers(sample.questions.map(() => null));
    setSubmitted(false);
    setIncomplete(false);
    explanations.current.forEach(detail => { if (detail) detail.open = false; });
    firstOptions.current[0]?.focus();
  }

  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green)]";
  return <section aria-labelledby={`${id}-title`} className="rounded-xl border border-[var(--line)] bg-white p-5 text-[var(--ink)] sm:p-7" id={sample.id} lang={locale}>
    <p className="text-sm font-bold text-[var(--green)]">{vi ? "Bài mẫu tự biên soạn · không cần tài khoản" : "Original practice · no account needed"}</p>
    <h2 className="mt-2 text-2xl font-bold" id={`${id}-title`} lang="vi">{sample.title}</h2>
    <p className="mt-3 leading-7 text-[var(--muted)]" lang="vi">{sample.instructions}</p>
    {sample.image && <figure className="mt-6"><Image alt={sample.image.alt} className="h-auto w-full rounded-lg" height={800} preload src={sample.image.src} width={1200} /><figcaption className="mt-2 text-sm text-[var(--muted)]">{vi ? "Ảnh minh họa gốc cho câu hỏi Part 1." : "Original illustration for the Part 1 question."}</figcaption></figure>}
    <audio aria-label={vi ? `Audio: ${sample.title}` : `TOEIC Part ${sample.part} practice audio`} className="mt-6 w-full" controls preload="metadata" src={sample.audio}>{vi ? "Trình duyệt không hỗ trợ phát audio." : "Your browser does not support audio playback."}</audio>
    <p className="mt-2 text-sm text-[var(--muted)]">{vi ? "Audio giọng tổng hợp dùng cho bài luyện. Các lựa chọn được hiển thị để học; khi tự kiểm tra, nghe trước khi đọc chữ." : "Synthesized speech for practice. Choices are shown for learning; listen before reading them when testing yourself."}</p>
    <div className="mt-7 space-y-7">{sample.questions.map((question, index) => <fieldset className="border-t border-[var(--line)] pt-5" key={question.prompt}>
      <legend className="font-bold leading-7" lang="en">{(sample.startNumber ?? 1) + index}. {question.prompt}</legend>
      <div className="mt-3 grid gap-2" lang="en">{question.options.map((option, optionIndex) => <label className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border p-3 focus-within:ring-2 focus-within:ring-[var(--green)] ${answers[index] === optionIndex ? "border-[var(--green)] bg-[#e7eee8]" : "border-[var(--line)]"}`} key={option}>
        <input className="mt-1" checked={answers[index] === optionIndex} name={`${id}-question-${index}`} onChange={() => { setAnswers(answers.map((answer, answerIndex) => answerIndex === index ? optionIndex : answer)); setSubmitted(false); setIncomplete(false); }} ref={optionIndex === 0 ? element => { firstOptions.current[index] = element; } : undefined} type="radio" value={optionIndex} />
        <span>{option}</span>
      </label>)}</div>
      {submitted && <p className="mt-3 font-bold">{answers[index] === question.answer ? (vi ? "Đúng." : "Correct.") : (vi ? "Cần xem lại." : "Review this answer.")}</p>}
      <details className="mt-3 rounded-lg border border-[var(--line)] p-3 leading-7" ref={element => { explanations.current[index] = element; }}>
        <summary className={`min-h-11 cursor-pointer content-center font-bold text-[var(--green)] ${focus}`}>{vi ? `Xem đáp án và lời giải câu ${(sample.startNumber ?? 1) + index}` : `Answer and explanation for question ${(sample.startNumber ?? 1) + index}`}</summary>
        <div className="mt-3" lang="vi"><p className="font-bold">Đáp án: <span lang="en">{question.options[question.answer]}</span></p><p>{question.explanation}</p></div>
      </details>
    </fieldset>)}</div>
    <div className="mt-7 flex flex-wrap gap-3">
      <button className={`min-h-12 rounded-lg bg-[var(--green)] px-5 font-bold text-white hover:bg-[#184631] ${focus}`} onClick={submit} type="button">{vi ? "Kiểm tra đáp án" : "Check answers"}</button>
      <button className={`min-h-12 rounded-lg border border-[var(--line)] px-5 font-bold ${focus}`} onClick={reset} type="button">{vi ? "Làm lại" : "Try again"}</button>
    </div>
    <p aria-live="polite" aria-atomic="true" className="mt-4 font-bold">{incomplete ? (vi ? `Hãy trả lời đủ ${sample.questions.length} câu trước khi kiểm tra.` : `Answer all ${sample.questions.length} questions before checking.`) : submitted ? (vi ? `Bạn đúng ${score}/${sample.questions.length} câu. Đây là kết quả bài luyện, không phải điểm TOEIC chính thức.` : `You answered ${score}/${sample.questions.length} correctly. This practice result is not an official TOEIC score.`) : ""}</p>
    <details className="mt-7 rounded-lg border border-[var(--line)] bg-[var(--paper)] p-4">
      <summary className={`min-h-11 cursor-pointer content-center font-bold ${focus}`}>{vi ? "Mở transcript để nghe lại và kiểm tra bằng chứng" : "Open the transcript to replay and check the evidence"}</summary>
      <div className="mt-4 space-y-3 leading-7" lang="en">{sample.transcript.map(line => <p key={line}>{line}</p>)}</div>
    </details>
    <noscript><p className="mt-4 leading-7">{vi ? "Nghe audio, ghi đáp án trên giấy rồi mở lời giải từng câu để tự chấm. Chấm bài tự động cần JavaScript." : "Listen, record your answers on paper, then open each explanation to check them. Automatic scoring requires JavaScript."}</p></noscript>
  </section>;
}
