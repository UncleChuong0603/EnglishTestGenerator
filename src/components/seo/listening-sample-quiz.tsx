"use client";

import Image from "next/image";
import { useState } from "react";
import type { ListeningSample } from "@/lib/seo/listening-samples";

export function ListeningSampleQuiz({ sample }: { sample: ListeningSample }) {
  const [answers, setAnswers] = useState<(number | null)[]>(sample.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const score = sample.questions.reduce((total, question, index) => total + Number(answers[index] === question.answer), 0);

  function submit() {
    if (answers.some(answer => answer === null)) {
      setError(`Hãy trả lời đủ ${sample.questions.length} câu trước khi xem lời giải.`);
      return;
    }
    setError("");
    setSubmitted(true);
  }

  return <section className="rounded-2xl border border-teal-200 bg-white p-5 sm:p-8" id="bai-nghe-mau">
    <p className="text-sm font-bold uppercase tracking-wider text-teal-800">Bài mẫu tự biên soạn · không cần tài khoản</p>
    <h2 className="mt-2 text-2xl font-black">Nghe thử TOEIC Part {sample.part}</h2>
    <p className="mt-3 leading-7 text-slate-700">{sample.instructions}</p>
    {sample.image && <figure className="mt-6"><Image alt={sample.image.alt} className="h-auto w-full rounded-xl" height={800} priority src={sample.image.src} width={1200} /><figcaption className="mt-2 text-sm text-slate-600">Ảnh minh họa gốc cho câu hỏi Part 1.</figcaption></figure>}
    <audio aria-label={`Audio bài mẫu TOEIC Part ${sample.part}`} className="mt-6 w-full" controls preload="metadata" src={sample.audio}>Trình duyệt không hỗ trợ phát audio.</audio>
    <div className="mt-7 space-y-7">{sample.questions.map((question, index) => <fieldset className="border-t border-slate-200 pt-5" key={question.prompt}>
      <legend className="font-bold leading-7">{index + 1}. {question.prompt}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${answers[index] === optionIndex ? "border-teal-700 bg-teal-50" : "border-slate-200"}`} key={option}>
        <input checked={answers[index] === optionIndex} name={`part-${sample.part}-sample-${index}`} onChange={() => { setAnswers(answers.map((answer, answerIndex) => answerIndex === index ? optionIndex : answer)); setSubmitted(false); setError(""); }} type="radio" value={optionIndex} />
        <span>{option}</span>
      </label>)}</div>
      {submitted && <p className={`mt-3 rounded-lg p-4 leading-7 ${answers[index] === question.answer ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-950"}`}>
        <strong>{answers[index] === question.answer ? "Đúng." : `Đáp án đúng: ${question.options[question.answer]}`}</strong> {question.explanation}
      </p>}
    </fieldset>)}</div>
    <button className="mt-7 min-h-12 rounded-lg bg-teal-800 px-6 font-bold text-white" onClick={submit} type="button">Kiểm tra đáp án</button>
    {error && <p aria-live="polite" className="mt-4 font-semibold text-amber-800">{error}</p>}
    {submitted && <p aria-live="polite" className="mt-4 font-bold text-teal-900">Bạn đúng {score}/{sample.questions.length} câu. Xem lời giải dưới từng câu.</p>}
    <details className="mt-7 rounded-lg border border-slate-200 bg-slate-50 p-5">
      <summary className="cursor-pointer font-bold">Mở transcript để nghe lại và kiểm tra bằng chứng</summary>
      <div className="mt-4 space-y-3 leading-7 text-slate-700">{sample.transcript.map(line => <p key={line}>{line}</p>)}</div>
    </details>
  </section>;
}
