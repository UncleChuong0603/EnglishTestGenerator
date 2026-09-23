"use client";
/* Signed private media URLs are dynamic. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function LessonWorkspace({ audioUrl, imageUrl, imageAlt, transcript, locale }: { audioUrl: string; imageUrl: string | null; imageAlt: string | null; transcript: string; locale: InterfaceLanguage }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speed, setSpeed] = useState(1);
  const vi = locale === "vi";
  return <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" aria-label={vi ? "Nghe và quan sát" : "Listen and observe"}>
      {imageUrl && <img alt={imageAlt ?? ""} className="mb-6 max-h-[50vh] w-full rounded-2xl object-contain" src={imageUrl} />}
      <h2 className="text-xl font-black">{vi ? "Nghe bài học" : "Listen to the lesson"}</h2>
      <audio aria-label={vi ? "Audio bài học" : "Lesson audio"} className="mt-4 w-full" controls preload="metadata" ref={audio} src={audioUrl} />
      <label className="mt-5 flex items-center gap-3 text-sm font-semibold">{vi ? "Tốc độ" : "Speed"}<select className="rounded-lg border px-3 py-2" onChange={event => { const value = Number(event.target.value); setSpeed(value); if (audio.current) audio.current.playbackRate = value; }} value={speed}>{[0.75, 1, 1.25].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>
      <p className="mt-4 text-sm text-slate-600">{vi ? "Thử nghe một lần trước khi mở transcript, rồi nghe lại và đối chiếu." : "Listen once before opening the transcript, then replay and compare."}</p>
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" aria-label="Transcript">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Transcript</h2><button aria-expanded={showTranscript} className="min-h-11 rounded-xl border border-teal-700 px-4 font-bold text-teal-800" onClick={() => setShowTranscript(!showTranscript)} type="button">{showTranscript ? (vi ? "Ẩn transcript" : "Hide transcript") : (vi ? "Hiện transcript" : "Show transcript")}</button></div>
      {showTranscript ? <p className="mt-5 whitespace-pre-line leading-8" lang="en">{transcript}</p> : <p className="mt-5 rounded-xl bg-slate-50 p-5 text-slate-600">{vi ? "Transcript đang ẩn để bạn tập trung nghe." : "The transcript is hidden so you can focus on listening."}</p>}
    </section>
  </div>;
}
