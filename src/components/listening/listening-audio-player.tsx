"use client";
import { useRef, useState } from "react";
import { refreshListeningMedia } from "@/app/practice/actions";

export function ListeningAudioPlayer({ sessionId, questionId, assetId, initialUrl, labels }: { sessionId: string; questionId: string; assetId: string; initialUrl: string; labels: { play: string; pause: string; replay: string; loading: string; unavailable: string; retry: string } }) {
  const ref = useRef<HTMLAudioElement>(null); const [url, setUrl] = useState(initialUrl); const [state, setState] = useState<"idle" | "loading" | "playing" | "paused" | "ended" | "error">("idle");
  async function toggle() { const audio = ref.current; if (!audio) return; if (state === "playing") { audio.pause(); return; } setState("loading"); try { await audio.play(); } catch { setState("error"); } }
  async function retry() { setState("loading"); const result = await refreshListeningMedia(sessionId, questionId, assetId); if (!result.ok) { setState("error"); return; } setUrl(result.url); setState("idle"); }
  const text = state === "playing" ? labels.pause : state === "ended" ? labels.replay : labels.play;
  return <div><audio key={url} onEnded={() => setState("ended")} onError={() => setState("error")} onPause={() => setState((value) => value === "ended" ? value : "paused")} onPlaying={() => setState("playing")} onWaiting={() => setState("loading")} preload="metadata" ref={ref} src={url} />
    {state === "error" ? <div className="rounded-xl bg-red-50 p-4" role="alert"><p className="text-sm text-red-700">{labels.unavailable}</p><button className="mt-2 min-h-11 rounded-lg bg-slate-900 px-4 font-bold text-white" onClick={retry} type="button">{labels.retry}</button></div> : <button aria-label={state === "loading" ? labels.loading : text} className="min-h-12 w-full rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-60" disabled={state === "loading"} onClick={toggle} type="button">{state === "loading" ? labels.loading : text}</button>}
  </div>;
}

