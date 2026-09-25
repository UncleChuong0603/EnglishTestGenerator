"use client";

import { useEffect, useMemo, useRef } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";

const shortPrefix = /^(?:[A-D]|Mr|Mrs|Ms|Dr)\.$/i;

export function splitTranscriptSentences(transcript: string): string[] {
  const pieces = [...new Intl.Segmenter("en", { granularity: "sentence" }).segment(transcript)]
    .map(({ segment }) => segment.trim())
    .filter(Boolean);
  const sentences: string[] = [];
  let prefix = "";
  for (const piece of pieces) {
    if (shortPrefix.test(piece)) {
      prefix += `${piece} `;
      continue;
    }
    sentences.push(`${prefix}${piece}`);
    prefix = "";
  }
  if (prefix) sentences.push(prefix.trim());
  return sentences;
}

export function currentSentenceIndex(sentences: readonly string[], time: number, duration: number): number {
  if (sentences.length < 2 || !Number.isFinite(duration) || duration <= 0) return 0;
  const weights = sentences.map(sentence => Math.max(1, sentence.match(/[\p{L}\p{N}]+/gu)?.length ?? 0) + 1);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const position = Math.max(0, Math.min(1, time / duration)) * total;
  let boundary = 0;
  for (const [index, weight] of weights.entries()) {
    boundary += weight;
    if (position < boundary) return index;
  }
  return sentences.length - 1;
}

export function FollowingTranscript({ transcript, time, duration, locale }: { transcript: string; time: number; duration: number; locale: InterfaceLanguage }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLElement>(null);
  const { sentences, paragraphStarts } = useMemo(() => {
    const sentences: string[] = [];
    const paragraphStarts = new Set<number>();
    for (const paragraph of transcript.split(/\n\s*\n/)) {
      if (!paragraph.trim()) continue;
      paragraphStarts.add(sentences.length);
      sentences.push(...splitTranscriptSentences(paragraph));
    }
    return { sentences, paragraphStarts };
  }, [transcript]);
  const active = currentSentenceIndex(sentences, time, duration);
  useEffect(() => {
    const container = scrollRef.current;
    const sentence = activeRef.current;
    if (!container || !sentence) return;
    const top = container.scrollTop + sentence.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo({ top: Math.max(0, top - container.clientHeight / 3) });
  }, [active, transcript]);
  return <>
    <p className="mt-4 text-sm font-semibold text-teal-800">{locale === "vi" ? "Câu đang nghe được tô sáng ước lượng theo audio; câu tiếp theo vẫn hiển thị để bạn chuẩn bị." : "The current sentence is highlighted approximately; the next sentence stays visible so you can prepare."}</p>
    <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2" ref={scrollRef}><p className="text-lg leading-9" lang="en">{sentences.map((sentence, index) => <span className={paragraphStarts.has(index) && index > 0 ? "mt-5 block" : undefined} key={index}>{index > 0 && !paragraphStarts.has(index) ? " " : null}{index === active ? <mark aria-current="true" className="rounded-md bg-teal-100 px-1 py-0.5 font-semibold text-slate-950 ring-1 ring-teal-600" ref={activeRef}>{sentence}</mark> : sentence}</span>)}</p></div>
  </>;
}
