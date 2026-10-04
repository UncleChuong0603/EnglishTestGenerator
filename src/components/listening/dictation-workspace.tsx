"use client";

import { useEffect, useRef, useState } from "react";
import type {
  DictationAttemptResponse,
  DictationHintResponse,
  DictationSessionResponse,
} from "@/lib/api-v1/contracts";
import type { InterfaceLanguage } from "@/lib/i18n/config";

type Session = DictationSessionResponse["data"];
export function DictationWorkspace({
  sessionId,
  locale,
}: {
  sessionId: string;
  locale: InterfaceLanguage;
}) {
  const vi = locale === "vi";
  const audio = useRef<HTMLAudioElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState<DictationHintResponse["data"] | null>(null);
  const [result, setResult] = useState<
    DictationAttemptResponse["data"]["result"] | null
  >(null);
  const [speed, setSpeed] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void fetch(`/api/v1/dictation/${sessionId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((body: DictationSessionResponse) => setSession(body.data))
      .catch(() =>
        setError(
          vi ? "Không thể tải buổi luyện." : "Could not load this session.",
        ),
      );
  }, [sessionId, vi]);

  function repeat() {
    if (!audio.current) return;
    audio.current.currentTime = 0;
    void audio.current.play();
  }
  async function requestHint() {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/dictation/${sessionId}/hint`, {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      const body = (await response.json()) as DictationHintResponse;
      setHint(body.data);
    } catch {
      setError(vi ? "Không thể mở gợi ý." : "Could not load the hint.");
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!answer.trim()) {
      setError(
        vi ? "Hãy nhập điều bạn nghe được." : "Type what you heard first.",
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/dictation/${sessionId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      if (!response.ok) throw new Error();
      const body = (await response.json()) as DictationAttemptResponse;
      setSession(body.data);
      setResult(body.data.result);
    } catch {
      setError(
        vi ? "Chưa thể kiểm tra câu trả lời." : "Could not check your answer.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!session)
    return (
      <p
        aria-live="polite"
        className="mt-8 rounded-xl bg-white p-5 text-slate-600"
      >
        {error ?? (vi ? "Đang tải…" : "Loading…")}
      </p>
    );
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)]">
      <section
        aria-labelledby="listen-heading"
        className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7"
      >
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">
          {vi ? "Segment 1 phút" : "One-minute segment"}
        </p>
        <h2 className="mt-2 text-2xl font-black" id="listen-heading">
          {session.title[locale]}
        </h2>
        <p className="mt-2 text-slate-600">
          {vi
            ? "Nghe toàn bộ segment và chép lại bằng tiếng Anh. Dấu câu và chữ hoa không ảnh hưởng; từ bị thiếu hoặc thay thế vẫn được tính."
            : "Listen to the full segment and transcribe it in English. Punctuation and capitals do not count; missing or substituted words do."}
        </p>
        <audio
          aria-label={vi ? "Audio chính tả" : "Dictation audio"}
          className="mt-5 w-full"
          controls
          preload="metadata"
          ref={audio}
          src={session.audioUrl}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="min-h-11 rounded-xl border border-teal-700 px-4 font-bold text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
            onClick={repeat}
            type="button"
          >
            {vi ? "Nghe lại segment" : "Repeat segment"}
          </button>
          <label className="flex min-h-11 items-center gap-2 font-semibold">
            {vi ? "Tốc độ" : "Speed"}
            <select
              className="min-h-11 rounded-lg border px-3"
              onChange={(event) => {
                const value = Number(event.target.value);
                setSpeed(value);
                if (audio.current) audio.current.playbackRate = value;
              }}
              value={speed}
            >
              <option value={0.75}>0.75×</option>
              <option value={1}>1×</option>
            </select>
          </label>
        </div>
        <label className="mt-6 block font-bold" htmlFor="dictation-answer">
          {vi ? "Điều bạn nghe được" : "What you heard"}
        </label>
        <textarea
          autoCapitalize="off"
          className="mt-2 min-h-52 w-full rounded-xl border border-slate-300 p-4 leading-7 focus:border-teal-700 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700"
          id="dictation-answer"
          onChange={(event) => setAnswer(event.target.value)}
          spellCheck={false}
          value={answer}
        />
        {error ? (
          <p
            aria-live="polite"
            className="mt-3 text-sm font-semibold text-red-700"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="min-h-11 rounded-xl bg-teal-800 px-5 font-bold text-white disabled:opacity-60"
            disabled={busy}
            onClick={() => void submit()}
            type="button"
          >
            {busy
              ? vi
                ? "Đang kiểm tra…"
                : "Checking…"
              : vi
                ? "Kiểm tra"
                : "Check"}
          </button>
          <button
            className="min-h-11 rounded-xl border px-5 font-bold"
            disabled={busy || Boolean(hint)}
            onClick={() => void requestHint()}
            type="button"
          >
            {vi ? "Gợi ý" : "Hint"}
          </button>
        </div>
        {hint ? (
          <p className="mt-3 rounded-xl bg-amber-50 p-4 text-amber-950">
            {vi
              ? `Segment có ${hint.wordCount} từ và bắt đầu bằng “${hint.openingWord}”.`
              : `The segment has ${hint.wordCount} words and starts with “${hint.openingWord}”.`}
          </p>
        ) : null}
      </section>
      <section
        aria-labelledby="feedback-heading"
        className="self-start rounded-3xl border border-slate-200 bg-white p-5 sm:p-7"
      >
        <h2 className="text-xl font-black" id="feedback-heading">
          {vi ? "Phản hồi & transcript" : "Feedback & transcript"}
        </h2>
        {!result && !session.transcript ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-5 text-slate-600">
            {vi
              ? "Transcript sẽ hiện sau lần kiểm tra đầu tiên để bạn có cơ hội nghe chủ động."
              : "The transcript appears after your first check so you can listen actively first."}
          </p>
        ) : null}
        {result ? (
          <div aria-live="polite" className="mt-4">
            <p
              className={`rounded-xl p-4 font-bold ${result.exact ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950"}`}
            >
              {result.exact
                ? vi
                  ? "Đã chép chính xác — segment này được đánh dấu đã thành thạo."
                  : "Exact transcription — this segment is marked mastered."
                : vi
                  ? `Khớp ${result.accuracy}% từ theo đúng thứ tự. Nghe lại rồi thử tiếp.`
                  : `${result.accuracy}% of words matched in order. Listen again and retry.`}
            </p>
            {result.missingWords.length ? (
              <p className="mt-3 text-sm">
                <strong>
                  {vi ? "Từ cần nghe lại:" : "Words to listen for:"}
                </strong>{" "}
                {result.missingWords.join(", ")}
              </p>
            ) : null}
            {result.extraWords.length ? (
              <p className="mt-2 text-sm">
                <strong>
                  {vi
                    ? "Từ nhập thêm/thay thế:"
                    : "Extra or substituted words:"}
                </strong>{" "}
                {result.extraWords.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
        {session.transcript ? (
          <div className="mt-5">
            <h3 className="font-black">Transcript</h3>
            <p className="mt-2 whitespace-pre-line rounded-xl bg-slate-50 p-5 leading-7">
              {session.transcript}
            </p>
            <p className="mt-4 text-sm text-slate-600">
              {vi
                ? "Kết quả này chỉ phản ánh độ chính xác của segment, không quy đổi thành điểm TOEIC."
                : "This result reflects this segment only and is not converted into a TOEIC score."}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
