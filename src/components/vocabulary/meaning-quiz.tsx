"use client";

import { useMemo, useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { createVocabularyQuizQuestion, type VocabularyQuizQuestion } from "@/lib/vocabulary/quiz";
import type { StudyTopic } from "@/lib/vocabulary/study-list";

const QUESTION_COUNT = 10;

export function VocabularyMeaningQuiz({ topics, locale }: { topics: StudyTopic[]; locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  const entries = useMemo(() => topics.flatMap((topic) => topic.entries), [topics]);
  const firstQuestion = useMemo(() => createVocabularyQuizQuestion(entries, locale, () => 0), [entries, locale]);
  const [question, setQuestion] = useState<VocabularyQuizQuestion | null>(firstQuestion);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);

  if (!question) return null;

  const selectedIsCorrect = selectedOptionId === question.correctOptionId;
  const chooseOption = (optionId: string) => {
    if (selectedOptionId) return;
    setSelectedOptionId(optionId);
    if (optionId === question.correctOptionId) setScore((value) => value + 1);
  };
  const moveNext = () => {
    if (!selectedOptionId) return;
    if (answeredCount + 1 >= QUESTION_COUNT) {
      setAnsweredCount((value) => value + 1);
      setComplete(true);
      return;
    }
    const next = createVocabularyQuizQuestion(entries, locale, Math.random, question.entryKey) ?? firstQuestion;
    setQuestion(next);
    setSelectedOptionId(null);
    setAnsweredCount((value) => value + 1);
  };
  const restart = () => {
    setQuestion(createVocabularyQuizQuestion(entries, locale, Math.random) ?? firstQuestion);
    setSelectedOptionId(null);
    setAnsweredCount(0);
    setScore(0);
    setComplete(false);
  };

  return <section className="mt-10 scroll-mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-7" id="vocabulary-meaning-quiz" aria-labelledby="vocabulary-meaning-quiz-title">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[.16em] text-teal-800">{vi ? "Luyện nhanh" : "Quick practice"}</p>
        <h2 className="mt-1 text-2xl font-black" id="vocabulary-meaning-quiz-title">{vi ? "Trắc nghiệm chọn nghĩa đúng" : "Choose the correct meaning"}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{vi ? "Chọn nghĩa đúng cho từ hoặc cụm từ. Mỗi câu có 4 đáp án lấy từ kho nghĩa TOEIC." : "Choose the correct meaning for each word or phrase. Every question has four choices from the TOEIC meaning pool."}</p>
      </div>
      {!complete && <p className="shrink-0 text-sm font-bold text-teal-900" aria-live="polite">{vi ? `Câu ${answeredCount + 1}/${QUESTION_COUNT}` : `Question ${answeredCount + 1}/${QUESTION_COUNT}`}</p>}
    </div>

    {complete ? <div className="mt-6 rounded-xl border border-teal-300 bg-white p-5" role="status"><p className="text-lg font-black">{vi ? `Bạn đúng ${score}/${QUESTION_COUNT} câu.` : `You got ${score}/${QUESTION_COUNT} correct.`}</p><p className="mt-2 text-sm leading-6 text-slate-600">{vi ? "Làm lại để gặp một nhóm từ khác trong kho nghĩa." : "Try again to practise a different group from the meaning pool."}</p><button className="mt-4 min-h-11 rounded-lg bg-teal-800 px-4 font-bold text-white transition hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900" onClick={restart} type="button">{vi ? "Làm lại 10 câu" : "Try 10 more"}</button></div> : <>
      <div className="mt-6 rounded-xl border border-teal-200 bg-white p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-wider text-teal-800">{vi ? "Từ cần chọn nghĩa" : "Word or phrase"}</p><h3 className="mt-2 text-3xl font-black tracking-tight" lang="en">{question.term}</h3></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2" role="group" aria-label={vi ? "Các đáp án" : "Answer choices"}>{question.options.map((option, index) => { const selected = selectedOptionId === option.id; const correct = option.id === question.correctOptionId; const stateClass = selectedOptionId ? correct ? "border-teal-700 bg-teal-50 text-teal-950" : selected ? "border-amber-500 bg-amber-50 text-amber-950" : "border-slate-200 bg-white text-slate-800" : selected ? "border-teal-700 bg-teal-50 text-teal-950" : "border-slate-200 bg-white text-slate-800 hover:border-teal-400 hover:bg-white"; return <button aria-pressed={selected} className={`flex min-h-14 items-start gap-3 rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-default ${stateClass}`} disabled={Boolean(selectedOptionId)} key={option.id} onClick={() => chooseOption(option.id)} type="button"><span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-current text-sm font-black">{String.fromCharCode(65 + index)}</span><span className="min-w-0 break-words leading-6">{option.text}</span></button>; })}</div>
      <div aria-live="polite" className="mt-4 min-h-7 text-sm font-semibold">{selectedOptionId ? selectedIsCorrect ? <span className="text-teal-800">{vi ? "Đúng rồi." : "Correct."}</span> : <span className="text-amber-900">{vi ? `Chưa đúng. Đáp án đúng là: ${question.options.find((option) => option.id === question.correctOptionId)?.text}.` : `Not quite. The correct answer is: ${question.options.find((option) => option.id === question.correctOptionId)?.text}.`}</span> : null}</div>
      <button className="mt-2 min-h-11 rounded-lg bg-teal-800 px-5 font-bold text-white transition hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900 disabled:cursor-not-allowed disabled:opacity-50" disabled={!selectedOptionId} onClick={moveNext} type="button">{answeredCount + 1 >= QUESTION_COUNT ? (vi ? "Xem kết quả" : "See result") : (vi ? "Câu tiếp theo" : "Next question")}</button>
    </>}
  </section>;
}
