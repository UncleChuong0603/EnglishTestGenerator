"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { FollowingTranscript } from "./following-transcript";

export type ShadowingClip = {
  id: string;
  minutes: 1 | 3 | 5 | 10;
  topic: string;
  title: string;
  audioUrl: string;
  transcript: string;
};

function clock(seconds: number) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function ShadowingPlayer({ clips, locale, signedIn = true }: { clips: readonly ShadowingClip[]; locale: InterfaceLanguage; signedIn?: boolean }) {
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
  const signInHref = "/sign-in?next=%2Flistening-lessons";
  const trialClipId = clips[0]?.id;

  function selectClip(id: string) {
    audioRef.current?.pause();
    if (id === selectedId && audioRef.current) audioRef.current.currentTime = 0;
    setSelectedId(id);
    setTime(0);
    setDuration(id === selectedId ? audioRef.current?.duration ?? 0 : 0);
    setError(false);
  }

  return <div className="mt-7 space-y-6">
    <section aria-labelledby="transcript-heading" className="rounded-2xl border border-[#dce3d9] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dce3d9] pb-5">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-wider text-[#245a43]">{vi ? "Script bài nghe" : "Listening script"}</p>
          <h2 className="mt-1 text-2xl font-black text-[#172821]" id="transcript-heading">Transcript</h2>
          <p className="mt-1 text-sm font-semibold text-[#45584d]">{clip.title} · {minutes} {vi ? "phút" : minutes === 1 ? "minute" : "minutes"}</p>
        </div>
        <button
          aria-controls="listening-transcript"
          aria-expanded={showTranscript}
          className="min-h-11 rounded-lg border border-[#245a43] px-4 font-bold text-[#245a43] hover:bg-[#eef3eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]"
          onClick={() => setShowTranscript(value => !value)}
          type="button"
        >
          {showTranscript ? (vi ? "Ẩn script" : "Hide script") : (vi ? "Hiện script" : "Show script")}
        </button>
      </div>
      <div id="listening-transcript">
        {showTranscript
          ? <FollowingTranscript duration={duration} locale={locale} time={time} transcript={clip.transcript} />
          : <p className="mt-5 rounded-xl bg-[#f7f6f1] p-5 text-[#45584d]">{vi ? "Script đang được ẩn. Hãy nghe trước rồi mở lại khi bạn muốn đối chiếu." : "The script is hidden. Listen first, then open it when you want to check."}</p>}
      </div>
    </section>

    <section aria-labelledby="player-heading" className="rounded-2xl border border-[#dce3d9] bg-white p-5 sm:p-7">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-wider text-[#245a43]">{vi ? "Bài đang nghe" : "Now playing"}</p>
          <h2 className="mt-1 text-xl font-black text-[#172821]" id="player-heading">{clip.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#45584d]">{vi ? "Nghe, tạm dừng hoặc tua lại; câu tương ứng trong script phía trên sẽ được tô sáng." : "Listen, pause, or replay; the matching sentence in the script above will be highlighted."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#45584d]">
          <span className="rounded-full bg-[#eef3eb] px-3 py-1.5">{clip.topic}</span>
          <span className="rounded-full border border-[#dce3d9] px-3 py-1.5">{minutes} {vi ? "phút" : minutes === 1 ? "minute" : "minutes"}</span>
        </div>
      </div>

      {!signedIn ? <div className="mt-5 rounded-xl border border-[#b9d7c2] bg-[#eef3eb] p-4 text-sm leading-6 text-[#172821]"><strong>{vi ? "Bài nghe thử miễn phí." : "Free sample."}</strong> {vi ? "Bạn có thể nghe trọn bài này và dùng script; đăng nhập để mở các bài còn lại." : "Listen to this complete talk and use its script; sign in to unlock the rest."}</div> : null}

      <audio
        aria-label={vi ? "Audio bài chia sẻ" : "Talk audio"}
        className="mt-5 w-full"
        controls
        key={clip.id}
        onDurationChange={event => setDuration(event.currentTarget.duration)}
        onEnded={event => setTime(event.currentTarget.duration)}
        onError={() => setError(true)}
        onLoadedMetadata={event => { event.currentTarget.playbackRate = speed; }}
        onSeeked={event => setTime(event.currentTarget.currentTime)}
        onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
        preload="metadata"
        ref={audioRef}
        src={clip.audioUrl}
      />

      <div className="mt-4 grid gap-4 border-t border-[#dce3d9] pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <div className="flex items-center justify-between gap-4 text-sm font-semibold tabular-nums text-[#45584d]"><span>{clock(time)} / {duration > 0 && Number.isFinite(duration) ? clock(duration) : `${minutes}:00`}</span><span>{duration > 0 && Number.isFinite(duration) ? `${Math.min(100, Math.round(time / duration * 100))}%` : "0%"}</span></div>
          <progress aria-label={vi ? "Tiến độ bài nghe" : "Talk progress"} className="mt-2 h-2 w-full accent-[#245a43]" max={duration > 0 && Number.isFinite(duration) ? duration : minutes * 60} value={time} />
        </div>
        <label className="flex min-h-11 items-center gap-3 text-sm font-bold text-[#172821]">{vi ? "Tốc độ" : "Speed"}<select className="min-h-11 rounded-lg border border-[#9caaa0] bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" onChange={event => { const value = Number(event.target.value); setSpeed(value); if (audioRef.current) audioRef.current.playbackRate = value; }} value={speed}>{[0.75, 1, 1.25].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>
      </div>
      {error && <p className="mt-4 text-sm font-semibold text-red-700" role="alert">{vi ? "Không phát được audio. Hãy thử tải lại trang." : "The audio could not play. Please reload the page."}</p>}
    </section>

    <section aria-labelledby="topic-picker-heading" className="border-t border-[#cbd7cb] pt-7">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-wider text-[#245a43]">{vi ? "Đổi bài nghe" : "Change talk"}</p>
        <h2 className="mt-1 text-2xl font-black text-[#172821]" id="topic-picker-heading">{vi ? "Chọn thời lượng và chủ đề" : "Choose a length and topic"}</h2>
        <p className="mt-2 leading-7 text-[#45584d]">{vi ? "Chọn thời lượng trước; danh sách chủ đề phù hợp sẽ hiện ngay bên dưới." : "Choose a length first; matching topics will appear directly below."}</p>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-bold text-[#172821]">{vi ? "Thời lượng" : "Length"}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {durations.map(value => {
            const target = clips.find(item => item.minutes === value)!;
            const className = `inline-flex min-h-11 items-center rounded-full px-5 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43] ${minutes === value ? "bg-[#245a43] text-white" : "border border-[#9caaa0] bg-white text-[#245a43] hover:border-[#245a43] hover:bg-[#eef3eb]"}`;
            const label = <>{value} {vi ? "phút" : value === 1 ? "minute" : "minutes"}</>;
            return !signedIn && target.id !== trialClipId
              ? <Link className={className} href={signInHref} key={value}>{label}</Link>
              : <button aria-pressed={minutes === value} className={className} key={value} onClick={() => selectClip(target.id)} type="button">{label}</button>;
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <h3 className="text-base font-black text-[#172821]">{vi ? `Chủ đề ${minutes} phút` : `${minutes}-minute topics`}</h3>
        <div aria-label={vi ? "Chủ đề audio" : "Audio topics"} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="group">
          {choices.map(item => {
            const selected = clip.id === item.id;
            const className = `min-h-24 rounded-xl border p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43] ${selected ? "border-[#245a43] bg-[#eef3eb] text-[#172821]" : "border-[#dce3d9] bg-white text-[#172821] hover:border-[#245a43]"}`;
            const content = <><span className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-wider text-[#245a43]"><span>{item.topic}</span>{selected ? <span>{vi ? "Đang nghe" : "Playing"}</span> : null}</span><span className="mt-2 block font-bold leading-6">{item.title}</span>{!signedIn && item.id !== trialClipId ? <span className="mt-2 block text-xs font-bold text-[#45584d]">{vi ? "Đăng nhập để mở" : "Sign in to open"}</span> : null}</>;
            return !signedIn && item.id !== trialClipId
              ? <Link className={className} href={signInHref} key={item.id}>{content}</Link>
              : <button aria-pressed={selected} className={className} key={item.id} onClick={() => selectClip(item.id)} type="button">{content}</button>;
          })}
        </div>
      </div>
    </section>
  </div>;
}
