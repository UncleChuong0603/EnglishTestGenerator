"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { SupportForm } from "@/components/support-form";

const hiddenKey = "toeic-gym-feedback-hidden";
const visibilityEvent = "feedback-visibility-change";
let hiddenInMemory = false;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(visibilityEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(visibilityEvent, callback);
  };
}

function isHidden() {
  try { return window.localStorage.getItem(hiddenKey) === "1"; }
  catch { return hiddenInMemory; }
}

function setHidden(hidden: boolean) {
  hiddenInMemory = hidden;
  try {
    if (hidden) window.localStorage.setItem(hiddenKey, "1");
    else window.localStorage.removeItem(hiddenKey);
  } catch { /* Keep the control usable when browser storage is unavailable. */ }
  window.dispatchEvent(new Event(visibilityEvent));
}

export function RestoreFeedbackButton({ locale }: { locale: "vi" | "en" }) {
  const hidden = useSyncExternalStore(subscribe, isHidden, () => false);
  if (!hidden) return null;
  return <button type="button" onClick={() => setHidden(false)} className="mt-5 min-h-11 text-sm font-semibold text-[#245a43] underline underline-offset-4">{locale === "vi" ? "Hiện lại nút góp ý ở góc màn hình" : "Show the feedback button again"}</button>;
}

export function FeedbackWidget() {
  const locale = useLocale();
  const vi = locale === "vi";
  const pathname = usePathname();
  const hidden = useSyncExternalStore(subscribe, isHidden, () => true);
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);

  if (hidden || pathname === "/" || pathname === "/challenge/part-5" || pathname === "/support" || pathname.startsWith("/admin")) return null;

  return <div className="feedback-widget fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 print:hidden">
    <div className="flex items-center overflow-hidden rounded-full border border-white/20 bg-[#245a43] text-white shadow-lg shadow-black/15">
      <button type="button" className="flex min-h-11 items-center gap-2 py-2 pl-4 pr-3 text-xs font-bold hover:bg-[#184631]" aria-haspopup="dialog" onClick={() => { setOpened(true); dialog.current?.showModal(); }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0Z" /><path d="M7 9h10M7 13h6" /></svg>
        {vi ? "Góp ý" : "Feedback"}
      </button>
      <button type="button" className="flex min-h-11 w-9 items-center justify-center border-l border-white/20 text-lg hover:bg-[#184631]" aria-label={vi ? "Ẩn nút góp ý" : "Hide feedback button"} title={vi ? "Ẩn nút · Mở lại ở mục Hỗ trợ cuối trang" : "Hide · Access support from the footer"} onClick={() => setHidden(true)}>×</button>
    </div>
    <dialog ref={dialog} aria-labelledby="feedback-dialog-title" aria-describedby="feedback-dialog-description" className="fixed inset-auto bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] m-0 max-h-[calc(100dvh-2rem)] w-[min(24rem,calc(100vw-2rem))] max-w-none overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl backdrop:bg-slate-950/25" onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current?.close();
    }}>
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3"><h2 id="feedback-dialog-title" className="text-lg font-bold">{vi ? "Góp ý & hỗ trợ" : "Feedback & support"}</h2><button type="button" autoFocus onClick={() => dialog.current?.close()} className="flex size-11 shrink-0 items-center justify-center rounded-full text-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={vi ? "Đóng hỗ trợ" : "Close support"}>×</button></div>
        <p id="feedback-dialog-description" className="mt-1 text-sm leading-6 text-slate-500">{vi ? "TOEIC GYM luôn lắng nghe bạn." : "The TOEIC GYM team is here to help."}</p>
      </div>
      {opened && <SupportForm locale={locale} />}
    </dialog>
  </div>;
}
