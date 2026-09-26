"use client";

import { useState } from "react";

const questions = [
  {
    text: "What event are the speakers preparing for?",
    options: ["An awards dinner", "A product demonstration", "A retirement interview", "A training seminar"],
    correct: 0,
    explanation: "Người đàn ông nhắc đến invitations for the awards dinner ngay ở câu đầu. Hãy nghe sự kiện được gọi tên trước khi xét các chi tiết tiếp theo.",
  },
  {
    text: "What problem does the woman mention?",
    options: ["The invitations arrived late", "The envelopes show an old address", "The dinner venue is unavailable", "The guest list is incomplete"],
    correct: 1,
    explanation: "Người phụ nữ nói các phong bì có old office address. Máy in đã giao hàng sáng nay; vấn đề là địa chỉ trên phong bì, không phải thời điểm giao.",
  },
  {
    text: "What will the man probably do next?",
    options: ["Reserve a restaurant", "Revise the guest list", "Contact the printer", "Deliver the invitations himself"],
    correct: 2,
    explanation: "Câu I'll ask the printer to send corrected envelopes cho biết hành động tiếp theo. Ask the printer được diễn đạt lại trong đáp án thành contact the printer.",
  },
] as const;

export function Part3Sample() {
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const score = questions.reduce<number>((total, question, index) => total + Number(answers[index] === question.correct), 0);

  function checkAnswers() {
    if (answers.some((answer) => answer === null)) {
      setError("Hãy trả lời đủ ba câu trước khi xem lời giải.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  return <section aria-labelledby="part3-sample-title" className="rounded-2xl border border-teal-200 bg-white p-5 sm:p-8" id="bai-nghe-mau">
    <p className="text-sm font-bold uppercase tracking-wider text-teal-800">Bài nghe tự biên soạn · không cần tài khoản</p>
    <h2 className="mt-2 text-2xl font-black" id="part3-sample-title">Thử một hội thoại Part 3</h2>
    <p className="mt-3 leading-7 text-slate-700">Đọc trước ba câu hỏi, nghe hội thoại một lượt rồi chọn đáp án. Sau khi nộp, hãy nghe lại cùng transcript để tìm đúng câu chứa bằng chứng.</p>
    <audio className="mt-6 w-full" controls preload="metadata" src="/seo/toeic-part-3-sample.mp3">Trình duyệt của bạn không hỗ trợ phát audio.</audio>
    <div className="mt-7 space-y-7">{questions.map((question, index) => <fieldset className="border-t border-slate-200 pt-5" key={question.text}>
      <legend className="font-bold leading-7">{index + 1}. {question.text}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${answers[index] === optionIndex ? "border-teal-700 bg-teal-50" : "border-slate-200"}`} key={option}>
        <input checked={answers[index] === optionIndex} name={`part3-sample-${index}`} onChange={() => { setAnswers(answers.map((answer, answerIndex) => answerIndex === index ? optionIndex : answer)); setSubmitted(false); setError(""); }} type="radio" value={optionIndex} />
        <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
      </label>)}</div>
      {submitted && <p className={`mt-3 rounded-lg p-4 leading-7 ${answers[index] === question.correct ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-950"}`}>
        <strong>{answers[index] === question.correct ? "Đúng." : `Đáp án đúng: ${String.fromCharCode(65 + question.correct)}. ${question.options[question.correct]}.`}</strong> {question.explanation}
      </p>}
    </fieldset>)}</div>
    <button className="mt-7 min-h-12 rounded-lg bg-teal-800 px-6 font-bold text-white" onClick={checkAnswers} type="button">Kiểm tra đáp án</button>
    {error && <p aria-live="polite" className="mt-4 font-semibold text-amber-800">{error}</p>}
    {submitted && <p aria-live="polite" className="mt-4 font-bold text-teal-900">Bạn đúng {score}/3 câu. Xem lời giải dưới từng câu.</p>}
    <details className="mt-7 rounded-lg border border-slate-200 bg-slate-50 p-5">
      <summary className="cursor-pointer font-bold">Mở transcript để nghe lại và đối chiếu bằng chứng</summary>
      <div className="mt-4 space-y-3 leading-7 text-slate-700">
        <p><strong>Man:</strong> Have the invitations for the awards dinner been mailed yet?</p>
        <p><strong>Woman:</strong> Not yet. The printer delivered them this morning, but the envelopes have the old office address.</p>
        <p><strong>Man:</strong> I&apos;ll ask the printer to send corrected envelopes by express delivery.</p>
      </div>
    </details>
  </section>;
}
