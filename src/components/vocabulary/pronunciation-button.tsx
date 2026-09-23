"use client";

import { useState } from "react";

export function PronunciationButton({ term, kind, locale }: { term: string; kind: "word" | "phrase"; locale: "vi" | "en" }) {
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
    const audio = new Audio(`/api/vocabulary/audio/${encodeURIComponent(term)}`);
    let fallbackStarted = false;
    const fallback = () => { if (fallbackStarted) return; fallbackStarted = true; speak(); };
    audio.onended = () => setPlaying(false);
    audio.onerror = fallback;
    try { await audio.play(); } catch { fallback(); }
  }
  return <button aria-label={locale === "vi" ? `Nghe phát âm ${term}` : `Hear ${term} pronounced`} className="inline-flex min-h-10 items-center rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-bold text-teal-800 hover:bg-teal-100 disabled:opacity-60" disabled={playing} onClick={play} type="button">{playing ? "…" : "🔊"} <span className="ml-1">{locale === "vi" ? "Nghe" : "Listen"}</span></button>;
}
