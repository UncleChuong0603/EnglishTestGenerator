"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  DictationCatalogResponse,
  DictationHistoryResponse,
} from "@/lib/api-v1/contracts";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function DictationCatalog({ locale }: { locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  const router = useRouter();
  const [data, setData] = useState<DictationCatalogResponse["data"] | null>(
    null,
  );
  const [history, setHistory] = useState<DictationHistoryResponse["data"]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    void Promise.all([
      fetch("/api/v1/dictation"),
      fetch("/api/v1/dictation/history"),
    ])
      .then(async ([catalogResponse, historyResponse]) => {
        if (!catalogResponse.ok || !historyResponse.ok)
          throw new Error("catalog");
        return Promise.all([
          catalogResponse.json() as Promise<DictationCatalogResponse>,
          historyResponse.json() as Promise<DictationHistoryResponse>,
        ]);
      })
      .then(([catalogBody, historyBody]) => {
        setData(catalogBody.data);
        setHistory(historyBody.data);
      })
      .catch(() =>
        setError(
          vi
            ? "Không thể tải bài chính tả."
            : "Could not load dictation clips.",
        ),
      );
  }, [vi]);

  async function start(sourceRef: string) {
    setBusy(sourceRef);
    setError(null);
    try {
      const response = await fetch("/api/v1/dictation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceRef }),
      });
      if (!response.ok) throw new Error("start");
      const body = (await response.json()) as { data: { id: string } };
      router.push(`/listening-lessons/dictation/${body.data.id}`);
    } catch {
      setError(
        vi
          ? "Không thể bắt đầu. Vui lòng thử lại."
          : "Could not start. Please try again.",
      );
      setBusy(null);
    }
  }

  if (!data && !error)
    return (
      <p aria-live="polite" className="mt-8 text-slate-600">
        {vi ? "Đang tải bài nghe…" : "Loading clips…"}
      </p>
    );
  return (
    <div className="mt-8">
      {data?.recommendation ? (
        <p className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <strong>
            {vi ? "Gợi ý theo lỗi gần đây:" : "Suggested from recent mistakes:"}
          </strong>{" "}
          {data.recommendation.reasonCode === "MISHEARD_WORD"
            ? vi
              ? "luyện nhận diện từ nghe nhầm."
              : "practise words you misheard."
            : data.recommendation.reasonCode === "LISTENING_DETAIL"
              ? vi
                ? "luyện bắt chi tiết trong bài nghe."
                : "practise catching listening details."
              : vi
                ? "luyện nhận ra cách diễn đạt trong audio."
                : "practise recognising phrasing in audio."}
        </p>
      ) : null}
      {error ? (
        <p
          aria-live="polite"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((item) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-6"
            key={item.sourceRef}
          >
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">
              1 {vi ? "phút" : "minute"}
            </p>
            <h2 className="mt-3 text-xl font-black">{item.title[locale]}</h2>
            <p className="mt-2 text-slate-600">{item.description[locale]}</p>
            <button
              className="mt-5 min-h-11 w-full rounded-xl bg-teal-800 px-4 font-bold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:opacity-60"
              disabled={busy !== null}
              onClick={() => void start(item.sourceRef)}
              type="button"
            >
              {busy === item.sourceRef
                ? vi
                  ? "Đang mở…"
                  : "Opening…"
                : vi
                  ? "Bắt đầu nghe – chép"
                  : "Start dictation"}
            </button>
          </article>
        ))}
      </div>
      {history.length ? (
        <section aria-labelledby="dictation-history" className="mt-10">
          <h2 className="text-2xl font-black" id="dictation-history">
            {vi ? "Lịch sử gần đây" : "Recent history"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {vi
              ? "Tối đa 20 buổi gần nhất."
              : "Up to your 20 most recent sessions."}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {history.map((item) => (
              <Link
                className="rounded-2xl border border-slate-200 bg-white p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
                href={`/listening-lessons/dictation/${item.id}`}
                key={item.id}
              >
                <span className="font-black">{item.title[locale]}</span>
                <span className="mt-2 block text-sm text-slate-600">
                  {item.status === "MASTERED"
                    ? vi
                      ? "Đã thành thạo"
                      : "Mastered"
                    : vi
                      ? "Đang luyện"
                      : "In progress"}{" "}
                  · {vi ? "Tốt nhất" : "Best"} {item.bestAccuracy}%
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
