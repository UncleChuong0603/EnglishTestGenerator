"use client";

import { useState } from "react";
import Link from "next/link";

type ShareTarget = Pick<Navigator, "share"> & { clipboard?: Pick<Clipboard, "writeText"> };

export async function sharePart5Result(target: ShareTarget, score: number, locale: "vi" | "en", origin: string, preferNative = true) {
  const url = new URL("/challenge/part-5", origin).toString();
  const title = locale === "vi" ? "Thử thách TOEIC Part 5" : "TOEIC Part 5 Challenge";
  const text = locale === "vi" ? `Mình làm đúng ${score}/10 câu Part 5. Bạn thử nhé!` : `I got ${score}/10 in the Part 5 Challenge. Your turn!`;
  if (preferNative && typeof target.share === "function") {
    try { await target.share({ title, text, url }); return "shared" as const; }
    catch (error) { if (error instanceof DOMException && error.name === "AbortError") return "cancelled" as const; }
  }
  if (target.clipboard?.writeText) await target.clipboard.writeText(url);
  else {
    const field = document.createElement("textarea");
    field.value = url;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    if (!copied) throw new Error("Copy failed");
  }
  return "copied" as const;
}

export function ShareResult({ score, locale }: { score: number; locale: "vi" | "en" }) {
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  async function share() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await sharePart5Result(navigator, score, locale, window.location.origin, window.matchMedia("(pointer: coarse)").matches);
      setFeedback(result === "copied" ? (locale === "vi" ? "Đã sao chép link thử thách." : "Challenge link copied.") : result === "shared" ? (locale === "vi" ? "Đã mở chia sẻ." : "Share opened.") : "");
    } catch { setFeedback(locale === "vi" ? "Không thể sao chép tự động. Hãy dùng link bên dưới." : "Could not copy automatically. Use the link below."); }
    finally { setBusy(false); }
  }
  return <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8" aria-label={locale === "vi" ? "Chia sẻ kết quả" : "Share result"}>
    <h2 className="text-2xl font-black">{locale === "vi" ? "Thách bạn bè làm Part 5" : "Challenge a friend on Part 5"}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{locale === "vi" ? "Chia sẻ điểm số của bạn và link thử thách. Link không chứa kết quả hay thông tin tài khoản." : "Share your score and the challenge link. The link contains no result or account details."}</p>
    <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={share} disabled={busy} className="min-h-12 rounded-xl bg-slate-900 px-6 font-bold text-white disabled:opacity-60">{locale === "vi" ? "Chia sẻ / Sao chép link" : "Share / Copy link"}</button><Link className="break-all text-sm font-semibold text-teal-800 underline underline-offset-4" href="/challenge/part-5">/challenge/part-5</Link></div>
    <p aria-live="polite" className="mt-3 text-sm font-semibold text-teal-800">{feedback}</p>
  </section>;
}
