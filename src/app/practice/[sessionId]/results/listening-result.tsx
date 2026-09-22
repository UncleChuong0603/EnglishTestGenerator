/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { UnifiedRecommendationCard } from "@/components/diagnosis/recommendation-card";
import { ListeningAudioPlayer } from "@/components/listening/listening-audio-player";
import { TranscriptReview } from "@/components/listening/transcript-review";
import type { WorkoutRecommendation } from "@/lib/diagnosis/types";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { formatMessage, getTranslations } from "@/lib/i18n/get-translations";
import type { PracticeResult } from "@/lib/practice/types";
import { ReviewOutcome, type ReviewOutcomeData } from "@/components/mastery/review-outcome";
import { PremiumPreviewCard } from "@/components/premium/premium-preview";
import type { PremiumPreviewData } from "@/lib/premium/preview";

export function ListeningResult({ result, locale, recommendation, reviewOutcome, premiumPreview }: {
  result: PracticeResult;
  locale: InterfaceLanguage;
  recommendation: WorkoutRecommendation | null;
  reviewOutcome?: ReviewOutcomeData | null;
  premiumPreview?: PremiumPreviewData | null;
}) {
  const t = getTranslations(locale);
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-3xl">
    <section className="rounded-3xl bg-slate-900 p-7 text-white"><p className="font-bold uppercase tracking-wider text-teal-300">{t.listening.title} · Part {result.questions[0]?.part}</p><h1 className="mt-3 text-4xl font-black">{formatMessage(t.results.correctCount, { correct: result.scoreCorrect, total: result.scoreTotal })}</h1><Link className="mt-5 inline-flex min-h-12 items-center rounded-xl border border-slate-600 px-5 font-bold" href="/practice">{t.results.again}</Link></section>
    {reviewOutcome ? <ReviewOutcome data={reviewOutcome} locale={locale} /> : null}
    {recommendation ? <div className="mt-7"><UnifiedRecommendationCard locale={locale} recommendation={recommendation} /></div> : null}
    {premiumPreview?.visible && premiumPreview.progress.hasSkillBreakdownPotential ? <div className="mt-7"><PremiumPreviewCard locale={locale} title={locale === "vi" ? "Muốn luyện sâu hơn từ kết quả này?" : "Want to go deeper from this result?"} body={locale === "vi" ? "Premium có thể kết hợp kết quả này với lịch sử đủ mẫu của bạn để ưu tiên vùng cần cải thiện." : "Premium can combine this result with your established history to prioritize areas for improvement."} values={["targeting"]} /></div> : null}
    <div className="mt-7 space-y-6">{result.questions.map((question) => {
      const selected = question.options.find((option) => option.id === question.selectedOptionId);
      const correct = question.options.find((option) => option.id === question.correctOptionId);
      const audio = question.media?.find((media) => media.kind === "AUDIO");
      const image = question.media?.find((media) => media.kind === "IMAGE");
      return <article className={`rounded-2xl border bg-white p-5 sm:p-7 ${question.isCorrect ? "border-emerald-200" : "border-red-200"}`} key={question.id}>
        <p className={`font-black ${question.isCorrect ? "text-emerald-700" : "text-red-700"}`}>{t.practice.question} {question.number} · {question.isCorrect ? t.results.correct : t.results.incorrect}</p>
        {image ? <img alt={image.alt} className="mt-4 max-h-96 w-full rounded-xl object-contain" src={image.url}/> : null}
        {audio ? <div className="mt-4"><ListeningAudioPlayer assetId={audio.id} initialUrl={audio.url} labels={t.listening.audio} questionId={question.id} sessionId={result.id}/></div> : null}
        <dl className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><dt className="text-sm text-slate-600">{t.results.yourAnswer}</dt><dd className="font-bold">{selected ? `${selected.key}. ${selected.text}` : t.results.unanswered}</dd></div><div className="rounded-xl bg-emerald-50 p-4"><dt className="text-sm text-emerald-700">{t.results.correctAnswer}</dt><dd className="font-bold">{correct ? `${correct.key}. ${correct.text}` : t.common.unavailable}</dd></div></dl>
        {question.transcript && correct ? <TranscriptReview correctAnswer={correct.text} labels={{ show: t.listening.checkTranscript, keywords: t.listening.answerKeywords, noExactMatch: t.listening.noExactKeywordMatch }} transcript={question.transcript} /> : null}
        <section className="mt-5"><h2 className="font-black">{t.results.explanation}</h2><p className="mt-2 leading-7">{question.explanationVi ?? question.explanationEn}</p></section>
      </article>;
    })}</div>
  </div></main>;
}
