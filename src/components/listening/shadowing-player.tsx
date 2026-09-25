"use client";

import { useRef, useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { FollowingTranscript } from "./following-transcript";

export type ShadowingClip = {
  id: string;
  minutes: 1 | 3 | 5 | 10;
  title: string;
  audioUrl: string;
  transcript: string;
};

function clock(seconds: number) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function ShadowingPlayer({ clips, locale }: { clips: readonly ShadowingClip[]; locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedId, setSelectedId] = useState(clips[0]?.id ?? "");
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(true);
  const [error, setError] = useState(false);
  const clip = clips.find(item => item.id === selectedId) ?? clips[0];
  if (!clip) return null;
  const minutes = clip.minutes;
  const durations = [...new Set(clips.map(item => item.minutes))];
  const choices = clips.filter(item => item.minutes === minutes);

  function selectClip(id: string) {
    audioRef.current?.pause();
    if (id === selectedId && audioRef.current) audioRef.current.currentTime = 0;
    setSelectedId(id);
    setTime(0);
    setDuration(id === selectedId ? audioRef.current?.duration ?? 0 : 0);
    setError(false);
  }

  return <div className="mt-6 grid gap-5 lg:grid-cols-2">
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <p className="text-sm font-bold uppercase tracking-wider text-teal-700">{vi ? "Một bài nói liền mạch" : "One continuous talk"}</p>
      <h2 className="mt-2 text-2xl font-black">{vi ? "Chọn thời lượng audio" : "Choose the audio length"}</h2>
      <div aria-label={vi ? "Thời lượng audio" : "Audio duration"} className="mt-4 flex flex-wrap gap-2" role="group">
        {durations.map(value => <button aria-pressed={minutes === value} className={`min-h-11 rounded-full px-5 font-bold ${minutes === value ? "bg-teal-800 text-white" : "border border-teal-700 bg-white text-teal-800"}`} key={value} onClick={() => selectClip(clips.find(item => item.minutes === value)!.id)} type="button">{value} {vi ? "phút" : value === 1 ? "minute" : "minutes"}</button>)}
      </div>
      <p className="mt-3 text-sm text-slate-600">{vi ? "Mỗi audio là một bài chia sẻ riêng về một chủ đề khác nhau. Chọn thời lượng rồi chọn chủ đề bạn muốn nghe." : "Each audio is a complete talk on a different topic. Choose a length, then pick a topic."}</p>
      <div className="mt-5"><p className="text-sm font-bold text-slate-700">{vi ? "Chọn chủ đề" : "Choose a topic"}</p><div aria-label={vi ? "Chủ đề audio" : "Audio topics"} className="mt-2 flex flex-wrap gap-2" role="group">{choices.map(item => <button aria-pressed={clip.id === item.id} className={`min-h-11 rounded-xl px-4 text-left text-sm font-semibold ${clip.id === item.id ? "border border-teal-700 bg-teal-50 text-teal-900" : "border border-slate-300 bg-white text-slate-700 hover:border-teal-500"}`} key={item.id} onClick={() => selectClip(item.id)} type="button">{item.title}</button>)}</div></div>
      <div className="mt-7 rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-500">{vi ? "Bài đang nghe" : "Current talk"}</p>
        <h3 className="mt-1 text-lg font-black">{clip.title}</h3>
        <audio aria-label={vi ? "Audio bài chia sẻ" : "Talk audio"} className="mt-4 w-full" controls key={clip.id} onDurationChange={event => setDuration(event.currentTarget.duration)} onEnded={event => setTime(event.currentTarget.duration)} onError={() => setError(true)} onLoadedMetadata={event => { event.currentTarget.playbackRate = speed; }} onSeeked={event => setTime(event.currentTarget.currentTime)} onTimeUpdate={event => setTime(event.currentTarget.currentTime)} preload="metadata" ref={audioRef} src={clip.audioUrl} />
        <div className="mt-3 flex items-center justify-between text-sm font-semibold"><span>{clock(time)} / {duration > 0 && Number.isFinite(duration) ? clock(duration) : `${minutes}:00`}</span><span>{duration > 0 && Number.isFinite(duration) ? `${Math.min(100, Math.round(time / duration * 100))}%` : "0%"}</span></div>
        <progress aria-label={vi ? "Tiến độ bài nghe" : "Talk progress"} className="mt-2 h-2 w-full accent-teal-700" max={duration > 0 && Number.isFinite(duration) ? duration : minutes * 60} value={time} />
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold">{vi ? "Tốc độ" : "Speed"}<select className="rounded-lg border px-3 py-2" onChange={event => { const value = Number(event.target.value); setSpeed(value); if (audioRef.current) audioRef.current.playbackRate = value; }} value={speed}>{[0.75, 1, 1.25].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>
      </div>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{vi ? "Không phát được audio. Hãy thử tải lại trang." : "The audio could not play. Please reload the page."}</p>}
    </section>
    <section aria-label="Transcript" className="self-start rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Transcript</h2><button aria-expanded={showTranscript} className="min-h-11 rounded-xl border border-teal-700 px-4 font-bold text-teal-800" onClick={() => setShowTranscript(value => !value)} type="button">{showTranscript ? (vi ? "Ẩn transcript" : "Hide transcript") : (vi ? "Hiện transcript" : "Show transcript")}</button></div>
      {showTranscript ? <FollowingTranscript duration={duration} locale={locale} time={time} transcript={clip.transcript} /> : <p className="mt-5 rounded-xl bg-slate-50 p-5 text-slate-600">{vi ? "Hãy nghe trước, rồi hiện transcript khi bạn muốn đối chiếu." : "Listen first, then show the transcript when you want to check."}</p>}
    </section>
  </div>;
}
