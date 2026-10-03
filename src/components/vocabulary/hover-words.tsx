"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import type { DictionaryCard } from "@/lib/vocabulary/dictionary-types";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { DictionaryAttribution } from "./dictionary-attribution";

const wordPattern = /([A-Za-z]+(?:['’-][A-Za-z]+)*)/g;
const cardCache = new Map<string, DictionaryCard | null>();

function contextAround(text: string, word: string) {
  const index = text.toLowerCase().indexOf(word.toLowerCase());
  return text.slice(Math.max(0, index - 120), Math.min(text.length, index + word.length + 250)).trim();
}

function sentenceAround(text: string, word: string) {
  const index = text.toLowerCase().indexOf(word.toLowerCase());
  if (index < 0) return contextAround(text, word);
  const before = text.slice(0, index);
  const after = text.slice(index + word.length);
  const sentenceStart = Math.max(before.lastIndexOf("."), before.lastIndexOf("!"), before.lastIndexOf("?")) + 1;
  const endings = [after.indexOf("."), after.indexOf("!"), after.indexOf("?")].filter((position) => position >= 0);
  const sentenceEnd = index + word.length + (endings.length ? Math.min(...endings) + 1 : Math.min(after.length, 250));
  return text.slice(sentenceStart, sentenceEnd).replace(/\s+/g, " ").trim().slice(0, 450);
}

export function HoverWords({ text, locale, part = 5 }: { text: string; locale: InterfaceLanguage; part?: number }) {
  const instanceId = useId();
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const [active, setActive] = useState<{ word: string; x: number; y: number } | null>(null);
  const [card, setCard] = useState<DictionaryCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState(false);
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "sign_in" | "error">("idle");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);
  const vi = locale === "vi";
  const activeWord = active?.word;

  function cancelClose() { if (closeTimer.current) clearTimeout(closeTimer.current); }
  function closeSoon() { cancelClose(); closeTimer.current = setTimeout(() => { if (!panel.current?.contains(document.activeElement)) setActive(null); }, 220); }
  function open(word: string, target: HTMLElement) {
    cancelClose();
    window.dispatchEvent(new CustomEvent("vocabulary-open", { detail: instanceId }));
    trigger.current = target;
    if (word === activeWord) return;
    if (word !== activeWord) { setCard(null); setLoading(true); setMissing(false); }
    const rect = target.getBoundingClientRect();
    const x = Math.max(8, Math.min(rect.left, window.innerWidth - 336));
    const y = Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 410));
    setActive({ word, x, y });
    setSaveState("idle");
  }
  useEffect(() => {
    if (!activeWord) return;
    const word = activeWord.toLowerCase().replace(/[’]/g, "'");
    const lookupContext = vi ? sentenceAround(text, activeWord) : "";
    const cacheKey = `${word}|${lookupContext}`;
    const id = ++requestId.current;
    if (cardCache.has(cacheKey)) {
      const timer = setTimeout(() => { setCard(cardCache.get(cacheKey) ?? null); setMissing(!cardCache.get(cacheKey)); setLoading(false); }, 0);
      return () => clearTimeout(timer);
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (lookupContext) params.set("context", lookupContext);
        const response = await fetch(`/api/vocabulary/lookup/${encodeURIComponent(word)}${params.size ? `?${params}` : ""}`, { signal: controller.signal });
        const result = response.ok ? await response.json() as DictionaryCard : null;
        if (id !== requestId.current || controller.signal.aborted) return;
        if (result) {
          if (cardCache.size >= 300) cardCache.delete(cardCache.keys().next().value!);
          cardCache.set(cacheKey, result);
        }
        setCard(result); setMissing(!result);
      } catch {
        if (id === requestId.current && !controller.signal.aborted) { setCard(null); setMissing(true); }
      } finally { if (id === requestId.current && !controller.signal.aborted) setLoading(false); }
    }, 130);
    return () => { clearTimeout(timer); controller.abort(); requestId.current = id + 1; };
  }, [activeWord, lookupAttempt, text, vi]);
  useEffect(() => {
    const onOpen = (event: Event) => { if ((event as CustomEvent<string>).detail !== instanceId) setActive(null); };
    window.addEventListener("vocabulary-open", onOpen);
    return () => { window.removeEventListener("vocabulary-open", onOpen); if (closeTimer.current) clearTimeout(closeTimer.current); currentAudio.current?.pause(); };
  }, [instanceId]);
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setActive(null); };
    const outside = (event: Event) => { if (event.target instanceof Node && !panel.current?.contains(event.target) && !trigger.current?.contains(event.target)) setActive(null); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", outside, true);
    window.addEventListener("focusin", outside);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("pointerdown", outside); window.removeEventListener("scroll", outside, true); window.removeEventListener("focusin", outside); };
  }, [active]);
  async function save() {
    if (!active || !card || saveState === "saving") return;
    setSaveState("saving");
    const id = requestId.current;
    try {
      const response = await fetch("/api/vocabulary/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ word: card.term, context: contextAround(text, active.word), part }) });
      if (id !== requestId.current) return;
      if (response.status === 401) { setSaveState("sign_in"); return; }
      setSaveState(response.ok ? "saved" : "error");
    } catch { if (id === requestId.current) setSaveState("error"); }
  }
  function play() {
    if (!card) return;
    let fallbackStarted = false;
    const fallback = () => {
      if (fallbackStarted) return;
      fallbackStarted = true;
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const voice = new SpeechSynthesisUtterance(card.term);
      voice.lang = "en-US"; voice.rate = 0.85; window.speechSynthesis.speak(voice);
    };
    currentAudio.current?.pause();
    if (card.audioUrl) { const audio = new Audio(card.audioUrl); currentAudio.current = audio; audio.onerror = fallback; void audio.play().catch(fallback); }
    else fallback();
  }
  function retryLookup() {
    if (!activeWord) return;
    setCard(null); setMissing(false); setLoading(true); setLookupAttempt((attempt) => attempt + 1);
  }

  const chunks = text.split(wordPattern);
  return <>
    {chunks.map((chunk, index) => index % 2 === 0 || !/^[A-Za-z]+(?:['’-][A-Za-z]+)*$/.test(chunk) ? chunk :
      <span aria-haspopup="dialog" className="cursor-help rounded-sm decoration-teal-600 decoration-dotted underline-offset-4 hover:bg-teal-50 hover:underline focus-visible:bg-teal-50 focus-visible:underline focus-visible:outline-2 focus-visible:outline-teal-700" key={index} lang="en" onClick={(event) => { event.preventDefault(); event.stopPropagation(); open(chunk, event.currentTarget); }} onFocus={(event) => open(chunk, event.currentTarget)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(chunk, event.currentTarget); setTimeout(() => panel.current?.querySelector<HTMLButtonElement>("button")?.focus(), 0); } }} onMouseEnter={(event) => open(chunk, event.currentTarget)} onMouseLeave={closeSoon} role="button" tabIndex={0}>{chunk}</span>)}
    {active && typeof document !== "undefined" ? createPortal(<aside aria-label={vi ? `Từ vựng ${active.word}` : `Vocabulary ${active.word}`} className="fixed z-[100] w-[min(20rem,calc(100vw-1rem))] max-h-[min(25rem,calc(100vh-1rem))] overflow-y-auto rounded-2xl border border-teal-200 bg-white p-4 text-left text-slate-900 shadow-2xl" onMouseEnter={cancelClose} onMouseLeave={closeSoon} ref={panel} role="dialog" style={{ left: active.x, top: active.y }}>
      <button aria-label={vi ? "Đóng thẻ" : "Close card"} className="mb-1 ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700" onClick={() => setActive(null)} type="button"><svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg></button>
      {loading ? <p aria-live="polite" className="text-sm text-slate-600">{vi ? "Đang tra từ…" : "Looking up word…"}</p> : missing || !card ? <div><p className="text-sm text-slate-600">{vi ? "Chưa tìm thấy nghĩa phù hợp. Nguồn tra cứu có thể đang bận." : "No suitable meaning was found. The lookup source may be temporarily unavailable."}</p><button className="mt-3 min-h-11 rounded-lg border border-teal-700 px-3 text-sm font-bold text-teal-800 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" onClick={retryLookup} type="button">{vi ? "Thử lại" : "Try again"}</button></div> : <>
        <div className="flex items-start justify-between gap-2"><div><h3 className="text-xl font-black" lang="en">{card.term}</h3>{card.phonetic ? <p className="text-sm text-slate-600">{card.phonetic}</p> : null}</div><button aria-label={vi ? "Phát âm" : "Pronounce"} className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-teal-50 text-teal-800 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" onClick={play} type="button"><svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="M11 5 6.5 9H3v6h3.5l4.5 4V5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"/><path d="M15 9a4 4 0 0 1 0 6M17.8 6.8a7.4 7.4 0 0 1 0 10.4" stroke="currentColor" strokeLinecap="round" strokeWidth="2"/></svg></button></div>
        {card.partOfSpeech ? <p className="mt-2 text-xs font-bold uppercase tracking-wide text-teal-800">{card.partOfSpeech}</p> : null}
        {card.meaningVi ? <p className="mt-2 font-bold">{card.meaningVi}</p> : null}
        <p className="mt-1 text-sm text-slate-600">{card.meaningEn}</p>
        {vi && card.contextVi ? <div className="mt-3 rounded-xl bg-teal-50 p-3"><p className="text-xs font-bold text-teal-900">Nghĩa trong câu</p><p className="mt-1 text-sm leading-6 text-slate-700">{card.contextVi}</p></div> : null}
        <p className="mt-3 text-xs font-semibold text-slate-500">{card.example ? (vi ? "Ví dụ" : "Example") : (vi ? "Ngữ cảnh trong bài" : "Practice context")}</p>
        <p className="mt-1 rounded-xl bg-slate-50 p-3 text-sm italic leading-6" lang="en">{card.example || contextAround(text, active.word)}</p>
        <div className="mt-4 flex items-center gap-3"><button className="min-h-11 rounded-lg bg-teal-800 px-3 text-sm font-bold text-white disabled:opacity-60" disabled={saveState === "saving" || saveState === "saved"} onClick={save} type="button">{saveState === "saved" ? (vi ? "Đã lưu" : "Saved") : saveState === "saving" ? "…" : (vi ? "Lưu để ôn" : "Save to review")}</button><Link className="inline-flex min-h-11 items-center text-sm font-bold text-teal-800 underline" href="/vocabulary">{vi ? "Từ của tôi" : "My vocabulary"}</Link></div>
        {saveState === "sign_in" ? <Link className="mt-2 block text-sm font-bold text-teal-800 underline" href={`/sign-in?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/practice")}`}>{vi ? "Đăng nhập để lưu từ" : "Sign in to save this word"}</Link> : null}
        {saveState === "error" ? <p className="mt-2 text-xs text-red-700" role="alert">{vi ? "Lưu chưa thành công. Thử lại." : "Could not save. Try again."}</p> : null}
      </>}
      {card ? <DictionaryAttribution card={card} /> : null}
    </aside>, document.body) : null}
  </>;
}
