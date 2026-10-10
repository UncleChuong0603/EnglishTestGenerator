"use client";

import { useState } from "react";

export function PronunciationButton({ term, kind, locale, audioUrl }: { term: string; kind: "word" | "phrase"; locale: "vi" | "en"; audioUrl?: string | null }) {
  const [playing, setPlaying] = useState(false);
  function speak() {
    if (!("speechSynthesis" in window)) { setPlaying(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  }
  async function play() {
    setPlaying(true);
    if (kind === "phrase") { speak(); return; }
    const audio = new Audio(audioUrl || `/api/vocabulary/audio/${encodeURIComponent(term)}`);
    let fallbackStarted = false;
    const fallback = () => { if (fallbackStarted) return; fallbackStarted = true; speak(); };
    audio.onended = () => setPlaying(false);
    audio.onerror = fallback;
    try { await audio.play(); } catch { fallback(); }
  }
  return <button aria-label={locale === "vi" ? `Nghe phát âm ${term}` : `Hear ${term} pronounced`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-bold text-teal-800 transition-colors hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:opacity-60" disabled={playing} onClick={play} type="button">{playing ? <span aria-hidden="true" className="inline-flex size-5 items-center justify-center">…</span> : <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M11 5 6.5 8.5H3v7h3.5L11 19V5Zm4 3.5a5 5 0 0 1 0 7M17.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>}<span>{locale === "vi" ? "Nghe" : "Listen"}</span></button>;
}
