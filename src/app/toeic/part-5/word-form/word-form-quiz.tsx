"use client";

import { useState } from "react";

const questions = [
  { sentence: "The system updates customer records _____ after payment.", choices: ["A. immediate", "B. immediately", "C. immediacy", "D. mediate"], correct: 1, explanation: "Immediately là trạng từ bổ nghĩa cho động từ updates. Immediate là tính từ, immediacy là danh từ." },
  { sentence: "Our team appreciates your _____ response to the request.", choices: ["A. prompt", "B. promptly", "C. promptness", "D. prompting"], correct: 0, explanation: "Prompt là tính từ đứng trước danh từ response. Promptly là trạng từ; promptness là danh từ." },
  { sentence: "The report provides a detailed _____ of customer feedback.", choices: ["A. analyze", "B. analytical", "C. analysis", "D. analytically"], correct: 2, explanation: "Sau a detailed cần danh từ làm trung tâm cụm danh từ: analysis. Detailed bổ nghĩa cho danh từ này." },
  { sentence: "Staff members are asked to _____ all travel expenses by Friday.", choices: ["A. submitted", "B. submission", "C. submissive", "D. submit"], correct: 3, explanation: "Sau to trong cấu trúc are asked to cần động từ nguyên mẫu submit." },
  { sentence: "The instructions were written _____ so that all participants could follow them.", choices: ["A. clear", "B. clarity", "C. clearly", "D. clarify"], correct: 2, explanation: "Clearly là trạng từ bổ nghĩa cho động từ were written. Clear là tính từ." },
] as const;

export function WordFormQuiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const score = questions.filter((question, index) => answers[index] === question.correct).length;
  const remaining = questions.length - Object.keys(answers).length;

  return <section className="rounded-2xl border border-teal-200 bg-white p-6 sm:p-8" aria-labelledby="quiz-heading">
    <h2 className="text-2xl font-black" id="quiz-heading">Làm thử 5 câu Word Form</h2>
    <p className="mt-2 leading-7 text-slate-600">Chọn một đáp án cho mỗi câu. Bạn có thể kiểm tra ngay và đọc giải thích cho từng câu.</p>
    <div className="mt-7 space-y-8">{questions.map((question, index) => <fieldset className="border-t border-slate-200 pt-6" key={question.sentence}>
      <legend className="text-lg font-bold leading-8">{index + 1}. {question.sentence}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{question.choices.map((choice, choiceIndex) => <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${answers[index] === choiceIndex ? "border-teal-700 bg-teal-50" : "border-slate-200"}`} key={choice}>
        <input checked={answers[index] === choiceIndex} name={`word-form-${index}`} onChange={() => { setAnswers({ ...answers, [index]: choiceIndex }); setChecked(false); setShowIncomplete(false); }} type="radio" value={choiceIndex} />{choice}
      </label>)}</div>
      {checked && <p className={`mt-3 rounded-lg p-4 leading-7 ${answers[index] === question.correct ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-950"}`}>
        <strong>{answers[index] === question.correct ? "Đúng." : `Đáp án: ${question.choices[question.correct]}.`}</strong> {question.explanation}
      </p>}
    </fieldset>)}</div>
    <button className="mt-8 min-h-12 rounded-lg bg-teal-800 px-6 font-bold text-white" onClick={() => { if (remaining > 0) { setChecked(false); setShowIncomplete(true); return; } setShowIncomplete(false); setChecked(true); }} type="button">Kiểm tra đáp án</button>
    {showIncomplete && <p aria-live="polite" className="mt-4 text-sm font-semibold text-amber-800">Bạn còn {remaining} câu chưa chọn đáp án. Hãy trả lời đủ 5 câu trước khi kiểm tra.</p>}
    {checked && <p aria-live="polite" className="mt-4 text-lg font-bold">Bạn đúng {score}/{questions.length} câu. Xem giải thích bên dưới từng câu để biết vì sao.</p>}
  </section>;
}
