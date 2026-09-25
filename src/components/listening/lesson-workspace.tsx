"use client";
/* Signed private media URLs are dynamic. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { FollowingTranscript } from "./following-transcript";

export function LessonWorkspace({ audioUrl, imageUrl, imageAlt, transcript, locale }: { audioUrl: string; imageUrl: string | null; imageAlt: string | null; transcript: string; locale: InterfaceLanguage }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [showTranscript, setShowTranscript] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const vi = locale === "vi";
  return <div className="mt-7 grid gap-6 lg:grid-cols-2">
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" aria-label={vi ? "Nghe audio" : "Listen to audio"}>
      {imageUrl && <img alt={imageAlt ?? ""} className="mb-6 max-h-[50vh] w-full rounded-2xl object-contain" src={imageUrl} />}
      <h2 className="text-xl font-black">{vi ? "Nghe và nói theo" : "Listen and shadow"}</h2>
      <p className="mt-2 text-sm text-slate-600">{vi ? "Nghe audio, nhìn transcript bên cạnh và nói theo nhịp của người nói. Tạm dừng hoặc nghe lại bất cứ lúc nào." : "Listen, follow the transcript beside the audio, and speak along. Pause or replay whenever you like."}</p>
      <audio aria-label={vi ? "Audio bài học" : "Lesson audio"} className="mt-5 w-full" controls onDurationChange={event => setDuration(event.currentTarget.duration)} onSeeked={event => setTime(event.currentTarget.currentTime)} onTimeUpdate={event => { setTime(event.currentTarget.currentTime); if (event.currentTarget.currentTime >= 600) event.currentTarget.pause(); }} preload="metadata" ref={audio} src={audioUrl} />
      <label className="mt-5 flex items-center gap-3 text-sm font-semibold">{vi ? "Tốc độ" : "Speed"}<select className="rounded-lg border px-3 py-2" onChange={event => { const value = Number(event.target.value); setSpeed(value); if (audio.current) audio.current.playbackRate = value; }} value={speed}>{[0.75, 1, 1.25].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>
    </section>
    <section className="self-start rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" aria-label="Transcript">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Transcript</h2><button aria-expanded={showTranscript} className="min-h-11 rounded-xl border border-teal-700 px-4 font-bold text-teal-800" onClick={() => setShowTranscript(value => !value)} type="button">{showTranscript ? (vi ? "Ẩn transcript" : "Hide transcript") : (vi ? "Hiện transcript" : "Show transcript")}</button></div>
      {showTranscript ? <FollowingTranscript duration={Math.min(duration, 600)} locale={locale} time={time} transcript={transcript} /> : <p className="mt-5 rounded-xl bg-slate-50 p-5 text-slate-600">{vi ? "Hãy nghe trước, rồi hiện transcript khi bạn muốn đối chiếu." : "Listen first, then show the transcript when you want to check."}</p>}
    </section>
  </div>;
}
