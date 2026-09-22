import { buildTranscriptSegments, findAnswerKeywords } from "@/lib/listening/transcript-evidence";

export function TranscriptReview({
  transcript,
  correctAnswer,
  labels,
}: {
  transcript: string;
  correctAnswer: string;
  labels: { show: string; keywords: string; noExactMatch: string };
}) {
  const keywords = findAnswerKeywords(transcript, correctAnswer);
  const segments = buildTranscriptSegments(transcript, keywords);

  return <details className="group mt-5 border-t pt-5">
    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl bg-amber-50 px-4 py-3 font-black text-amber-950 marker:content-none">
      <span>{labels.show}</span>
      <span aria-hidden="true" className="text-xl transition-transform group-open:rotate-45">+</span>
    </summary>
    <div className="mt-4 rounded-2xl bg-slate-50 p-4 sm:p-5">
      <p className="whitespace-pre-line leading-7" lang="en">{segments.map((segment, index) => segment.highlighted
        ? <mark className="rounded bg-amber-200 px-1 font-bold text-slate-950" key={`${segment.text}-${index}`}>{segment.text}</mark>
        : <span key={`${segment.text}-${index}`}>{segment.text}</span>)}</p>
      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">{labels.keywords}</p>
        {keywords.length ? <div className="mt-2 flex flex-wrap gap-2">{keywords.map((keyword) => <span className="rounded-full bg-amber-200 px-3 py-1 text-sm font-bold text-amber-950" key={keyword.toLocaleLowerCase("en-US")}>{keyword}</span>)}</div> : <p className="mt-2 text-sm text-slate-600">{labels.noExactMatch}</p>}
      </div>
    </div>
  </details>;
}
