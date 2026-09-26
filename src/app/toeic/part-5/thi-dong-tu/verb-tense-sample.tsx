"use client";

import { useState } from "react";
import Link from "next/link";

const questions = [
  { text: "The regional office _____ its opening hours last Monday.", options: ["changes", "change", "changed", "will change"], correct: 2, explanation: "Last Monday là một mốc đã kết thúc. Dùng quá khứ đơn changed; will change nói về tương lai, còn changes là hiện tại đơn." },
  { text: "Ms. Ortiz _____ with the company since 2021.", options: ["has worked", "works", "was working", "will work"], correct: 0, explanation: "Since 2021 đánh dấu điểm bắt đầu của một việc kéo dài đến hiện tại. Has worked là hiện tại hoàn thành phù hợp trong câu này." },
  { text: "By the time the client arrived, the staff _____ the meeting room.", options: ["prepare", "had prepared", "will prepare", "are preparing"], correct: 1, explanation: "Việc chuẩn bị đã xong trước khi khách đến. Had prepared diễn tả sự kiện xảy ra trước một mốc quá khứ khác là arrived." },
  { text: "Please call again at two; the manager _____ with a client right now.", options: ["meets", "met", "is meeting", "has met"], correct: 2, explanation: "Right now cho biết cuộc họp đang diễn ra lúc nói. Is meeting là hiện tại tiếp diễn; câu đầu chỉ là lời đề nghị gọi lại sau." },
  { text: "The revised schedule _____ to all employees tomorrow.", options: ["will be sent", "sent", "has sent", "will send"], correct: 0, explanation: "Tomorrow chỉ tương lai, và lịch là thứ được gửi đi. Will be sent kết hợp tương lai với bị động; will send thiếu người thực hiện làm chủ ngữ." },
] as const;

export function VerbTenseSample() {
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const score = questions.reduce<number>((total, question, index) => total + Number(answers[index] === question.correct), 0);

  function checkAnswers() {
    if (answers.some((answer) => answer === null)) {
      setError("Hãy chọn đáp án cho đủ 5 câu trước khi kiểm tra.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  return <section aria-labelledby="tense-quiz-title" className="rounded-2xl border border-teal-200 bg-white p-5 sm:p-8" id="bai-tap">
    <p className="text-sm font-bold uppercase tracking-wider text-teal-800">Bài tập tự biên soạn · không cần tài khoản</p>
    <h2 className="mt-2 text-2xl font-black" id="tense-quiz-title">Làm thử 5 câu thì động từ</h2>
    <p className="mt-3 leading-7 text-slate-700">Tìm dấu hiệu thời gian và xác định thứ tự sự kiện trước khi chọn. Đáp án và lời giải chỉ hiện sau khi bạn nộp đủ 5 câu.</p>
    <div className="mt-7 space-y-7">{questions.map((question, index) => <fieldset className="border-t border-slate-200 pt-5" key={question.text}>
      <legend className="font-bold leading-7">{index + 1}. {question.text}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${answers[index] === optionIndex ? "border-teal-700 bg-teal-50" : "border-slate-200"}`} key={option}>
        <input checked={answers[index] === optionIndex} name={`verb-tense-${index}`} onChange={() => { setAnswers(answers.map((answer, answerIndex) => answerIndex === index ? optionIndex : answer)); setSubmitted(false); setError(""); }} type="radio" value={optionIndex} />
        <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
      </label>)}</div>
      {submitted && <p className={`mt-3 rounded-lg p-4 leading-7 ${answers[index] === question.correct ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-950"}`}>
        <strong>{answers[index] === question.correct ? "Đúng." : `Đáp án đúng: ${String.fromCharCode(65 + question.correct)}. ${question.options[question.correct]}.`}</strong> {question.explanation}
        <span className="mt-2 block text-sm">Ôn lại: <Link className="font-bold underline underline-offset-2" href={index === 4 ? "/blog/cau-bi-dong-toeic-part-5" : "/blog/thi-va-dang-dong-tu-toeic"}>{index === 4 ? "Câu bị động TOEIC Part 5" : "Thì và dạng động từ TOEIC"}</Link></span>
      </p>}
    </fieldset>)}</div>
    <button className="mt-7 min-h-12 rounded-lg bg-teal-800 px-6 font-bold text-white" onClick={checkAnswers} type="button">Kiểm tra đáp án</button>
    {error && <p aria-live="polite" className="mt-4 font-semibold text-amber-800">{error}</p>}
    {submitted && <p aria-live="polite" className="mt-4 font-bold text-teal-900">Bạn đúng {score}/5 câu. Xem lời giải dưới từng câu.</p>}
  </section>;
}
