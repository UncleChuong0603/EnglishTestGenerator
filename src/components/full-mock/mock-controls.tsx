"use client";
import { useEffect, useRef, useState } from "react";

export function MockNavigationGuard() { useEffect(() => { const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, []); return null; }

export function MockTimer({ deadline, finishAction }: { deadline: string; finishAction: () => Promise<void> }) {
  const form = useRef<HTMLFormElement>(null); const submitted = useRef(false); const [seconds, setSeconds] = useState(() => Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1_000)));
  useEffect(() => { const timer = window.setInterval(() => { const next = Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1_000)); setSeconds(next); if (next === 0 && !submitted.current) { submitted.current = true; form.current?.requestSubmit(); } }, 1_000); return () => window.clearInterval(timer); }, [deadline]);
  const minutes = Math.floor(seconds / 60); const remainder = String(seconds % 60).padStart(2, "0");
  return <form action={finishAction} ref={form}><time dateTime={deadline} suppressHydrationWarning>{minutes}:{remainder}</time></form>;
}

export function MockAudio({ runId, groupId, url }: { runId: string; groupId: string; url: string }) {
  const audio = useRef<HTMLAudioElement>(null); const key = `toeicgym:mock-audio:${runId}:${groupId}`; const [used, setUsed] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setUsed(sessionStorage.getItem(key) === "played"), 0); return () => window.clearTimeout(timer); }, [key]);
  async function play() { if (used || !audio.current) return; sessionStorage.setItem(key, "played"); setUsed(true); await audio.current.play().catch(() => undefined); }
  return <div><audio onContextMenu={(event) => event.preventDefault()} preload="metadata" ref={audio} src={url}/><button className="min-h-12 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-50" disabled={used} onClick={play} type="button">{used ? "Audio đã phát" : "Phát audio một lần"}</button></div>;
}
